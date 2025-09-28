from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

# Mock order data (in production, this would be stored in a database)
orders = []
order_id_counter = 1

@app.route('/api/checkout', methods=['POST'])
def checkout():
    global order_id_counter
    
    data = request.get_json()
    user_id = data.get('user_id')
    cart_items = data.get('cart_items', [])
    shipping_info = data.get('shipping_info', {})
    payment_info = data.get('payment_info', {})
    
    if not user_id or not cart_items:
        return jsonify({'error': 'User ID and cart items are required'}), 400
    
    # Calculate total
    total = sum(item.get('price', 0) * item.get('quantity', 1) for item in cart_items)
    
    # Create order
    order = {
        'id': order_id_counter,
        'user_id': user_id,
        'date': datetime.datetime.now().isoformat(),
        'total': total,
        'status': 'Processing',
        'shipping_info': shipping_info,
        'payment_info': {
            'method': payment_info.get('method', 'Credit Card'),
            'last_four': payment_info.get('card_number', '')[-4:] if payment_info.get('card_number') else ''
        },
        'items': cart_items
    }
    
    orders.append(order)
    order_id_counter += 1
    
    # In production, we would process payment here
    
    return jsonify({
        'message': 'Order placed successfully',
        'order_id': order['id'],
        'total': total
    })

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = next((o for o in orders if o['id'] == order_id), None)
    
    if order:
        return jsonify(order)
    else:
        return jsonify({'error': 'Order not found'}), 404

@app.route('/api/orders/user/<user_id>', methods=['GET'])
def get_user_orders(user_id):
    user_orders = [o for o in orders if o['user_id'] == user_id]
    return jsonify(user_orders)

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    data = request.get_json()
    status = data.get('status')
    
    if not status:
        return jsonify({'error': 'Status is required'}), 400
    
    order = next((o for o in orders if o['id'] == order_id), None)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    order['status'] = status
    
    return jsonify({'message': 'Order status updated', 'order': order})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)
