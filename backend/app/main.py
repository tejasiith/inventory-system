from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import products, customers, orders

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/")
def root():
    return {"message": "Inventory API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/dashboard")
def dashboard(db=None):
    from .database import SessionLocal
    from .models import Product, Customer, Order
    db = SessionLocal()
    try:
        total_products = db.query(Product).count()
        total_customers = db.query(Customer).count()
        total_orders = db.query(Order).count()
        low_stock = db.query(Product).filter(Product.quantity <= 5).all()
        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_products": [
                {"id": p.id, "name": p.name, "sku": p.sku, "quantity": p.quantity}
                for p in low_stock
            ],
        }
    finally:
        db.close()