const Modal = {
    overlay: document.querySelector('#modal-overlay'),
    toggle() {
        this.overlay.classList.toggle('active')
    }
}

const lStorage = {
    get() {
        return (
            JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
        )
    },

    set(transactions) {
        localStorage.setItem(
            'dev.finances:transactions',
            JSON.stringify(transactions)
        )
    }
}

const moneyCalc = {
    all: lStorage.get(),

    // Para receber os dados do form
    add(transaction) {
        this.all.push(transaction)
        App.reload()
    },

    remove(index) {
        this.all.splice(index, 1)
        App.reload()
    },

    income() {
        let income = 0
        this.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        console.log('income', income)
        return income
    },

    expenses() {
        let expense = 0
        this.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        console.log('expense', expense)
        return expense
    },

    total() {
        console.log('total', this.income() + this.expenses())
        return this.income() + this.expenses()
    }
}

const DOM = {
    transactionsTbody: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = this.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        this.transactionsTbody.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const money = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${money}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img
                onclick='moneyCalc.remove(${index})'
                src="./assets/minus.svg"
                alt="Remover transação"
            />
        </td>
`
        return html
    },

    updateBalance() {
        incomeValue.innerHTML = Utils.formatCurrency(moneyCalc.income())

        expenseValue.innerHTML = Utils.formatCurrency(moneyCalc.expenses() * -1)

        totalValue.innerHTML = Utils.formatCurrency(moneyCalc.total())
    },

    clearTransactions() {
        this.transactionsTbody.innerHTML = ''
    }
}

const Utils = {
    formatDate(date) {
        let reverseDate = date.split('-').reverse().join('/')
        return reverseDate
    },

    formatCurrency(value) {
        const signal = Number(value) >= 0 ? '' : '-'
        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),

    getValues() {
        return {
            description: this.description.value.trim(),
            amount: this.amount.value,
            date: this.date.value
        }
    },

    formatValues() {
        let { description, amount, date } = this.getValues()
        amount = amount * 100
        amount = Number(amount.toFixed(0))
        date = Utils.formatDate(date)

        return { description, amount, date }
    },

    clearFields() {
        this.description.value = ''
        this.amount.value = ''
        this.date.value = ''
    },

    submit(event) {
        event.preventDefault()
        const transaction = this.formatValues()
        console.log(transaction)
        moneyCalc.add(transaction)
        this.clearFields()
        Modal.toggle()
    }
}

const App = {
    init() {
        moneyCalc.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        lStorage.set(moneyCalc.all)
    },

    reload() {
        DOM.clearTransactions()
        this.init()
    }
}

App.init()
