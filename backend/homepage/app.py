from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock product data
products = [
    {
        "id": 1,
        "name": "Wireless Bluetooth Headphones",
        "price": 79.99,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        "description": "High-quality wireless headphones with noise cancellation",
        "category": "Electronics"
    },
    {
        "id": 2,
        "name": "Smartphone 128GB",
        "price": 699.99,
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
        "description": "Latest smartphone with advanced camera and fast processor",
        "category": "Electronics"
    },
    {
        "id": 3,
        "name": "Laptop 15-inch",
        "price": 999.99,
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
        "description": "Powerful laptop for work and entertainment",
        "category": "Electronics"
    },
    {
        "id": 4,
        "name": "Smart Watch",
        "price": 199.99,
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1399&q=80",
        "description": "Feature-rich smartwatch with health monitoring",
        "category": "Electronics"
    },
    {
        "id": 5,
        "name": "Digital Camera",
        "price": 549.99,
        "image": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        "description": "Professional digital camera for stunning photos",
        "category": "Electronics"
    },
    {
        "id": 6,
        "name": "Gaming Console",
        "price": 399.99,
        "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        "description": "Next-gen gaming console for immersive gameplay",
        "category": "Electronics"
    }
]

@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    
    if category:
        filtered_products = [p for p in products if p['category'] == category]
        return jsonify(filtered_products)
    
    return jsonify(products)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    
    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = list(set([p['category'] for p in products]))
    return jsonify(categories)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
