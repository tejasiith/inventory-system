from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models import Order, OrderItem, Product, Customer
from ..schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total = 0.0
    items_to_create = []

    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}"
            )
        total += product.price * item.quantity
        items_to_create.append((product, item.quantity, product.price))

    order = Order(customer_id=order_in.customer_id, total_amount=round(total, 2))
    db.add(order)
    db.flush()

    for product, qty, price in items_to_create:
        product.quantity -= qty
        db.add(OrderItem(order_id=order.id, product_id=product.id, quantity=qty, unit_price=price))

    db.commit()
    db.refresh(order)
    return db.query(Order).options(joinedload(Order.items)).filter(Order.id == order.id).first()


@router.get("", response_model=List[OrderOut])
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).options(joinedload(Order.items)).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Restore stock
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity
    db.delete(order)
    db.commit()