# Запуск проекту

## На Windows

1. Встановіть Python з сайту https://www.python.org (обов'язково виберіть "Add Python to PATH")

2. Відкрийте Command Prompt (cmd) або PowerShell у папці проекту

3. Виконайте команди:
```bash
pip install -r requirements.txt
python app.py
```

4. Браузер повинен автоматично відкритися на http://localhost:5000
   Якщо ні - введіть цю адресу вручну

## На Mac/Linux

1. Відкрийте терміналь у папці проекту

2. Виконайте команди:
```bash
pip3 install -r requirements.txt
python3 app.py
```

3. Відкрийте браузер та перейдіть на http://localhost:5000

## Можливі проблеми

### Помилка "python не знайден"
Спробуйте замість `python` використовувати `python3`

### Помилка про порт 5000 вже використовується
Змініть порт в app.py:
```python
app.run(debug=True, host='localhost', port=5001)
```

### Залежності не встановилися
Спробуйте:
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```
