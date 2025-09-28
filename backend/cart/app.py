from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock cart data (in production, this would be stored in a database)
carts = {}

@app.route('/api/cart', methods=['GET'])
def get_cart():
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    cart = carts.get(user_id, [])
    return jsonify(cart)

@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not user_id or not product_id:
        return jsonify({'error': 'User ID and Product ID are required'}), 400
    
    # Initialize cart if it doesn't exist
    if user_id not in carts:
        carts[user_id] = []
    
    # Check if product is already in cart
    cart = carts[user_id]
    existing_item = next((item for item in cart if item['product_id'] == product_id), None)
    
    if existing_item:
        existing_item['quantity'] += quantity
    else:
        # In production, we would fetch product details from the database
        cart.append({
            'product_id': product_id,
            'quantity': quantity
        })
    
    return jsonify({'message': 'Product added to cart', 'cart': cart})

@app.route('/api/cart', methods=['PUT'])
def update_cart():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    
    if not user_id or not product_id:
        return jsonify({'error': 'User ID and Product ID are required'}), 400
    
    if user_id not in carts:
        return jsonify({'error': 'Cart not found'}), 404
    
    cart = carts[user_id]
    item = next((item for item in cart if item['product_id'] == product_id), None)
    
    if not item:
        return jsonify({'error': 'Product not found in cart'}), 404
    
    if quantity <= 0:
        cart.remove(item)
    else:
        item['quantity'] = quantity
    
    return jsonify({'message': 'Cart updated', 'cart': cart})

@app.route('/api/cart', methods=['DELETE'])
def remove_from_cart():
    user_id = request.args.get('user_id')
    product_id = request.args.get('product_id')
    
    if not user_id or not product_id:
        return jsonify({'error': 'User ID and Product ID are required'}), 400
    
    if user_id not in carts:
        return jsonify({'error': 'Cart not found'}), 404
    
    cart = carts[user_id]
    item = next((item for item in cart if item['product_id'] == product_id), None)
    
    if not item:
        return jsonify({'error': 'Product not found in cart'}), 404
    
    cart.remove(item)
    
    return jsonify({'message': 'Product removed from cart', 'cart': cart})

@app.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    if user_id in carts:
        carts[user_id] = []
    
    return jsonify({'message': 'Cart cleared'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
