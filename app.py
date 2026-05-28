from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['SECRET_KEY'] = 'your-secret-key-here'

db = SQLAlchemy(app)

# Database Models
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    category = db.Column(db.String(50), default='Загальне')
    priority = db.Column(db.String(20), default='Нормальна')
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'priority': self.priority,
            'completed': self.completed,
            'created_at': self.created_at.strftime('%d.%m.%Y %H:%M'),
            'due_date': self.due_date.strftime('%d.%m.%Y') if self.due_date else ''
        }

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/todos', methods=['GET'])
def get_todos():
    filter_type = request.args.get('filter', 'all')
    category = request.args.get('category', '')
    priority = request.args.get('priority', '')

    query = Todo.query

    if filter_type == 'completed':
        query = query.filter_by(completed=True)
    elif filter_type == 'pending':
        query = query.filter_by(completed=False)

    if category:
        query = query.filter_by(category=category)

    if priority:
        query = query.filter_by(priority=priority)

    todos = query.order_by(Todo.created_at.desc()).all()
    return jsonify([todo.to_dict() for todo in todos])

@app.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.get_json()

    todo = Todo(
        title=data.get('title', 'Без назви'),
        description=data.get('description', ''),
        category=data.get('category', 'Загальне'),
        priority=data.get('priority', 'Нормальна')
    )

    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({'error': 'Завдання не знайдено'}), 404

    data = request.get_json()

    if 'title' in data:
        todo.title = data['title']
    if 'description' in data:
        todo.description = data['description']
    if 'category' in data:
        todo.category = data['category']
    if 'priority' in data:
        todo.priority = data['priority']
    if 'completed' in data:
        todo.completed = data['completed']

    db.session.commit()
    return jsonify(todo.to_dict())

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({'error': 'Завдання не знайдено'}), 404

    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Завдання видалено'})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total = Todo.query.count()
    completed = Todo.query.filter_by(completed=True).count()
    pending = Todo.query.filter_by(completed=False).count()

    categories = db.session.query(Todo.category, db.func.count(Todo.id)).group_by(Todo.category).all()

    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending,
        'categories': [{'name': c[0], 'count': c[1]} for c in categories]
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='localhost', port=5000)
