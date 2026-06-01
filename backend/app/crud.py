from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from decimal import Decimal
from app import models, schemas

# =====================================================================
# PRODUCT CRUD
# =====================================================================
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session):
    return db.query(models.Product).all()

def create_product(db: Session, product: schemas.ProductCreate):
    # Verify SKU uniqueness
    db_prod = get_product_by_sku(db, product.sku)
    if db_prod:
        raise ValueError("SKU already exists")
        
    try:
        db_product = models.Product(
            name=product.name,
            sku=product.sku,
            price=product.price,
            quantity_in_stock=product.quantity_in_stock
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except Exception:
        db.rollback()
        raise

def update_product(db: Session, product_id: int, product_data: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
        
    # Check duplicate SKU excluding itself
    existing = db.query(models.Product).filter(
        models.Product.sku == product_data.sku,
        models.Product.id != product_id
    ).first()
    if existing:
        raise ValueError("SKU already exists")
        
    try:
        db_product.name = product_data.name
        db_product.sku = product_data.sku
        db_product.price = product_data.price
        db_product.quantity_in_stock = product_data.quantity_in_stock
        db.commit()
        db.refresh(db_product)
        return db_product
    except Exception:
        db.rollback()
        raise

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
        
    try:
        db.delete(db_product)
        db.commit()
        return True
    except IntegrityError:
        db.rollback()
        raise ValueError("Cannot delete product because it is associated with existing orders")
    except Exception:
        db.rollback()
        raise


# =====================================================================
# CUSTOMER CRUD
# =====================================================================
def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email_address: str):
    return db.query(models.Customer).filter(models.Customer.email_address == email_address).first()

def get_customers(db: Session):
    return db.query(models.Customer).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    # Verify email uniqueness
    db_cust = get_customer_by_email(db, customer.email_address)
    if db_cust:
        raise ValueError("Email address already registered")
        
    try:
        db_customer = models.Customer(
            full_name=customer.full_name,
            email_address=customer.email_address,
            phone_number=customer.phone_number
        )
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except Exception:
        db.rollback()
        raise

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
        
    try:
        db.delete(db_customer)
        db.commit()
        return True
    except IntegrityError:
        db.rollback()
        raise ValueError("Cannot delete customer because they have placed orders")
    except Exception:
        db.rollback()
        raise


# =====================================================================
# ORDER CRUD
# =====================================================================
def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session):
    return db.query(models.Order).all()

def create_order(db: Session, order_data: schemas.OrderCreate):
    try:
        # 1. Verify customer exists
        db_customer = get_customer(db, order_data.customer_id)
        if not db_customer:
            raise ValueError("Customer not found")
            
        # 2. Iterate through items to compute total price, verify existence and verify stock
        order_items = []
        total_amount = Decimal("0.0")
        
        for item in order_data.items:
            db_product = get_product(db, item.product_id)
            if not db_product:
                raise ValueError(f"Product with ID {item.product_id} not found")
                
            if db_product.quantity_in_stock < item.quantity:
                raise ValueError(f"Insufficient stock for product '{db_product.name}'. Available: {db_product.quantity_in_stock}, Requested: {item.quantity}")
                
            # Reduce stock
            db_product.quantity_in_stock -= item.quantity
            
            # Calculate total
            total_amount += db_product.price * item.quantity
            
            # Create OrderItem object
            db_item = models.OrderItem(
                product_id=item.product_id,
                quantity=item.quantity
            )
            order_items.append(db_item)
            
        # 3. Create the Order
        db_order = models.Order(
            customer_id=order_data.customer_id,
            total_amount=total_amount,
            items=order_items
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception:
        db.rollback()
        raise

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
        
    try:
        db.delete(db_order)
        db.commit()
        return True
    except Exception:
        db.rollback()
        raise
