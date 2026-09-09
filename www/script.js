// ===== KALKULATOR JAVASCRIPT =====

class Calculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.expression = '';
        this.history = [];
        this.maxHistoryItems = 10;
        
        this.initElements();
        this.initEventListeners();
        this.loadTheme();
        this.loadHistory();
        this.updateDisplay();
    }
    
    initElements() {
        this.resultDisplay = document.getElementById('resultDisplay');
        this.expressionDisplay = document.getElementById('expressionDisplay');
        this.historyDisplay = document.getElementById('historyDisplay');
        this.historyContainer = document.getElementById('historyContainer');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.buttons = document.querySelectorAll('.btn');
    }
    
    initEventListeners() {
        // Event untuk tombol kalkulator
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.dataset.action;
                const value = button.dataset.value;
                
                if (value !== undefined) {
                    this.inputDigit(value);
                } else if (action) {
                    this.handleAction(action);
                }
                
                this.updateDisplay();
            });
        });
        
        // Event untuk keyboard (opsional)
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // Event untuk toggle tema
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Event untuk clear history
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Event untuk klik history item
        this.historyList.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const result = historyItem.dataset.result;
                if (result) {
                    this.currentValue = result;
                    this.expression = '';
                    this.operator = null;
                    this.waitingForOperand = false;
                    this.updateDisplay();
                }
            }
        });
    }
    
    handleKeyboard(e) {
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            this.inputDigit(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (key === '+') {
            this.handleOperator('+');
        } else if (key === '-') {
            this.handleOperator('-');
        } else if (key === '*') {
            this.handleOperator('*');
        } else if (key === '/') {
            this.handleOperator('/');
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === '%') {
            this.percent();
        }
        
        this.updateDisplay();
    }
    
    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            if (this.currentValue === '0' && digit !== '.') {
                this.currentValue = digit;
            } else {
                if (this.currentValue.length < 16) {
                    this.currentValue += digit;
                }
            }
        }
        
        // Update expression
        if (this.operator && this.previousValue !== '') {
            this.expression = `${this.formatNumber(this.previousValue)} ${this.operator} ${this.currentValue}`;
        }
        
        this.adjustFontSize();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
            return;
        }
        
        if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'percent':
                this.percent();
                break;
            case 'add':
                this.handleOperator('+');
                break;
            case 'subtract':
                this.handleOperator('-');
                break;
            case 'multiply':
                this.handleOperator('*');
                break;
            case 'divide':
                this.handleOperator('/');
                break;
            case 'negate':
                this.negate();
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }
    
    handleOperator(op) {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === '') {
            this.previousValue = this.currentValue;
        } else if (this.operator && !this.waitingForOperand) {
            const result = this.performCalculation();
            this.currentValue = String(result);
            this.previousValue = this.currentValue;
        } else {
            this.previousValue = this.currentValue;
        }
        
        this.operator = op;
        this.waitingForOperand = true;
        this.expression = `${this.formatNumber(this.previousValue)} ${op}`;
    }
    
    performCalculation() {
        const prev = parseFloat(this.previousValue);
        const curr = parseFloat(this.currentValue);
        
        let result = 0;
        
        switch (this.operator) {
            case '+':
                result = prev + curr;
                break;
            case '-':
                result = prev - curr;
                break;
            case '*':
                result = prev * curr;
                break;
            case '/':
                if (curr === 0) {
                    return 'Error: Bagi 0';
                }
                result = prev / curr;
                break;
            default:
                return curr;
        }
        
        // Batasi presisi
        if (typeof result === 'number') {
            result = Math.round(result * 1000000000000) / 1000000000000;
        }
        
        return result;
    }
    
    calculate() {
        if (this.operator === null || this.waitingForOperand) {
            return;
        }
        
        const expression = `${this.formatNumber(this.previousValue)} ${this.operator} ${this.formatNumber(this.currentValue)} =`;
        const result = this.performCalculation();
        
        if (typeof result === 'string' && result.startsWith('Error')) {
            this.showError(result);
            this.clear();
            this.updateDisplay();
            return;
        }
        
        // Simpan ke history
        this.addToHistory(expression, result);
        
        this.historyDisplay.textContent = `${expression} ${this.formatNumber(result)}`;
        this.expression = '';
        this.currentValue = String(result);
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        
        // Animasi pulse
        this.resultDisplay.classList.add('pulse');
        setTimeout(() => {
            this.resultDisplay.classList.remove('pulse');
        }, 200);
        
        this.adjustFontSize();
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.expression = '';
        this.historyDisplay.textContent = '';
        this.adjustFontSize();
    }
    
    backspace() {
        if (this.waitingForOperand) {
            return;
        }
        
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
    }
    
    percent() {
        const current = parseFloat(this.currentValue);
        this.currentValue = String(current / 100);
        this.adjustFontSize();
    }
    
    negate() {
        if (this.currentValue === '0') {
            return;
        }
        
        if (this.currentValue.startsWith('-')) {
            this.currentValue = this.currentValue.slice(1);
        } else {
            this.currentValue = '-' + this.currentValue;
        }
    }
    
    formatNumber(number) {
        if (typeof number === 'string') {
            return number;
        }
        
        if (Number.isInteger(number)) {
            return number.toString();
        }
        
        return number.toString();
    }
    
    adjustFontSize() {
        const length = this.currentValue.length;
        
        this.resultDisplay.classList.remove('small-text', 'very-small-text');
        
        if (length > 12) {
            this.resultDisplay.classList.add('very-small-text');
        } else if (length > 8) {
            this.resultDisplay.classList.add('small-text');
        }
    }
    
    showError(message) {
        this.resultDisplay.classList.add('shake');
        this.historyDisplay.textContent = message;
        
        setTimeout(() => {
            this.resultDisplay.classList.remove('shake');
        }, 300);
    }
    
    updateDisplay() {
        if (this.expression) {
            this.expressionDisplay.textContent = this.expression;
        } else {
            this.expressionDisplay.textContent = '';
        }
        
        this.resultDisplay.textContent = this.currentValue;
        this.adjustFontSize();
    }
    
    // ===== RIWAYAT =====
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: typeof result === 'number' ? result.toString() : result,
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(historyItem);
        
        if (this.history.length > this.maxHistoryItems) {
            this.history.pop();
        }
        
        this.saveHistory();
        this.renderHistory();
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            this.historyContainer.classList.remove('visible');
            return;
        }
        
        this.historyContainer.classList.add('visible');
        this.historyList.innerHTML = '';
        
        this.history.forEach((item) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.result = item.result;
            
            const expressionSpan = document.createElement('span');
            expressionSpan.className = 'history-expression';
            expressionSpan.textContent = item.expression;
            
            const resultSpan = document.createElement('span');
            resultSpan.className = 'history-result';
            resultSpan.textContent = item.result;
            
            historyItem.appendChild(expressionSpan);
            historyItem.appendChild(resultSpan);
            this.historyList.appendChild(historyItem);
        });
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }
    
    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.log('Gagal menyimpan history:', e);
        }
    }
    
    loadHistory() {
        try {
            const savedHistory = localStorage.getItem('calculatorHistory');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
                this.renderHistory();
            }
        } catch (e) {
            console.log('Gagal memuat history:', e);
            this.history = [];
        }
    }
    
    // ===== TEMA =====
    toggleTheme() {
        const currentTheme = document.body.dataset.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.dataset.theme = newTheme;
        this.themeIcon.textContent = newTheme === 'light' ? '☀️' : '🌙';
        
        try {
            localStorage.setItem('calculatorTheme', newTheme);
        } catch (e) {
            console.log('Gagal menyimpan tema:', e);
        }
    }
    
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('calculatorTheme');
            if (savedTheme) {
                document.body.dataset.theme = savedTheme;
                this.themeIcon.textContent = savedTheme === 'light' ? '☀️' : '🌙';
            }
        } catch (e) {
            console.log('Gagal memuat tema:', e);
        }
    }
}

// Inisialisasi kalkulator
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    
    // Tampilkan history jika ada
    calculator.renderHistory();
    
    // Cegah zoom pada double tap
    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    });
});
