from flask import Flask, jsonify, request
from flask_cors import CORS
import jwt
import datetime
from functools import wraps

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Mock user database
users = [
    {
        "id": 1,
        "email": "user@example.com",
        "password": "password123",
        "name": "John Doe",
        "address": "123 Main St, City, Country"
    }
]

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = next((u for u in users if u['email'] == data['email']), None)
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if any(u['email'] == data['email'] for u in users):
        return jsonify({'message': 'User already exists'}), 400
    
    # Create new user
    new_user = {
        "id": len(users) + 1,
        "email": data['email'],
        "password": data['password'],  # In production, hash the password
        "name": data.get('name', ''),
        "address": data.get('address', '')
    }
    
    users.append(new_user)
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = next((u for u in users if u['email'] == data['email'] and u['password'] == data['password']), None)
    
    if user:
        token = jwt.encode({
            'email': user['email'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        })
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'id': current_user['id'],
        'email': current_user['email'],
        'name': current_user['name'],
        'address': current_user['address']
    })

@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    # Update user details
    current_user['name'] = data.get('name', current_user['name'])
    current_user['address'] = data.get('address', current_user['address'])
    
    return jsonify({'message': 'Profile updated successfully'})

@app.route('/api/orders', methods=['GET'])
@token_required
def get_orders(current_user):
    # Mock orders data
    orders = [
        {
            "id": 1,
            "date": "2023-06-15",
            "total": 129.98,
            "status": "Delivered",
            "items": [
                {"name": "Wireless Bluetooth Headphones", "quantity": 1, "price": 79.99},
                {"name": "Phone Case", "quantity": 1, "price": 49.99}
            ]
        },
        {
            "id": 2,
            "date": "2023-05-20",
            "total": 199.99,
            "status": "Shipped",
            "items": [
                {"name": "Smart Watch", "quantity": 1, "price": 199.99}
            ]
        }
    ]
    
    return jsonify(orders)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
