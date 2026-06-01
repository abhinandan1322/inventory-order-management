from pydantic import BaseModel, Field, EmailStr
from typing import List
from datetime import datetime

# =====================================================================
# PRODUCT SCHEMAS
# =====================================================================
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, description="Product name")
    sku: str = Field(..., min_length=1, description="Product SKU / code")
    price: float = Field(..., gt=0.0, description="Product price (must be greater than zero)")
    quantity_in_stock: int = Field(..., ge=0, description="Product quantity in stock (cannot be negative)")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True


# =====================================================================
# CUSTOMER SCHEMAS
# =====================================================================
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, description="Customer's full name")
    email_address: EmailStr = Field(..., description="Customer's email address")
    phone_number: str = Field(..., min_length=1, description="Customer's phone number")

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True


# =====================================================================
# ORDER SCHEMAS
# =====================================================================
class OrderItemCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product being ordered")
    quantity: int = Field(..., gt=0, description="Quantity ordered (must be greater than 0)")

class OrderCreate(BaseModel):
    customer_id: int = Field(..., description="ID of the customer placing the order")
    items: List[OrderItemCreate] = Field(..., min_items=1, description="List of ordered items (at least one item required)")

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Product  # Nested product details

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    customer: Customer  # Nested customer details
    items: List[OrderItemResponse]  # Nested items

    class Config:
        from_attributes = True
