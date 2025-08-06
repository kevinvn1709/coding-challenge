const TOKENS = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: './assets/tokens/eth.svg',
    decimals: 18,
    coingeckoId: 'ethereum'
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: './assets/tokens/btc.svg',
    decimals: 8,
    coingeckoId: 'bitcoin'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: './assets/tokens/usdc.svg',
    decimals: 6,
    coingeckoId: 'usd-coin'
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether',
    icon: './assets/tokens/usdt.svg',
    decimals: 6,
    coingeckoId: 'tether'
  },
  BNB: {
    symbol: 'BNB',
    name: 'BNB',
    icon: './assets/tokens/bnb.svg',
    decimals: 18,
    coingeckoId: 'binancecoin'
  },
  ADA: {
    symbol: 'ADA',
    name: 'Cardano',
    icon: './assets/tokens/ada.svg',
    decimals: 6,
    coingeckoId: 'cardano'
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    icon: './assets/tokens/sol.svg',
    decimals: 9,
    coingeckoId: 'solana'
  },
  DOT: {
    symbol: 'DOT',
    name: 'Polkadot',
    icon: './assets/tokens/dot.svg',
    decimals: 10,
    coingeckoId: 'polkadot'
  },
  LINK: {
    symbol: 'LINK',
    name: 'Chainlink',
    icon: './assets/tokens/link.svg',
    decimals: 18,
    coingeckoId: 'chainlink'
  },
  UNI: {
    symbol: 'UNI',
    name: 'Uniswap',
    icon: './assets/tokens/uni.svg',
    decimals: 18,
    coingeckoId: 'uniswap'
  }
};

// App state
class SwapApp {
  constructor() {
    this.fromToken = 'ETH';
    this.toToken = 'USDC';
    this.prices = {};
    this.isLoading = false;
    this.currentModal = null;
    
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadPrices();
    this.updateUI();
  }

  bindEvents() {
    // Token selectors
    document.getElementById('from-token-selector').addEventListener('click', () => {
      this.openTokenModal('from');
    });
    
    document.getElementById('to-token-selector').addEventListener('click', () => {
      this.openTokenModal('to');
    });

    // Swap arrow
    document.getElementById('swap-arrow').addEventListener('click', () => {
      this.swapTokens();
    });

    // Amount input
    document.getElementById('from-amount').addEventListener('input', (e) => {
      this.calculateToAmount(e.target.value);
    });

    // MAX button
    document.getElementById('max-button').addEventListener('click', () => {
      this.setMaxAmount();
    });

    // Modal events
    document.getElementById('close-modal').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('token-modal').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal();
      }
    });

    // Search functionality
    document.getElementById('token-search').addEventListener('input', (e) => {
      this.filterTokens(e.target.value);
    });

    // Form submission
    document.getElementById('swap-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.executeSwap();
    });

    // Rate toggle
    document.querySelector('.rate-toggle').addEventListener('click', () => {
      this.toggleRate();
    });
  }

  async loadPrices() {
    try {
      const tokenIds = Object.values(TOKENS).map(token => token.coingeckoId).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const data = await response.json();
      
      // Map prices back to token symbols
      Object.entries(TOKENS).forEach(([symbol, token]) => {
        if (data[token.coingeckoId]) {
          this.prices[symbol] = data[token.coingeckoId].usd;
        }
      });
      
      console.log('Loaded prices:', this.prices);
    } catch (error) {
      console.error('Error loading prices:', error);
      // Fallback mock prices
      this.prices = {
        ETH: 2500,
        BTC: 45000,
        USDC: 1,
        USDT: 1,
        BNB: 300,
        ADA: 0.5,
        SOL: 100,
        DOT: 7,
        LINK: 15,
        UNI: 6
      };
    }
  }

  updateUI() {
    // Update from token
    document.getElementById('from-token-icon').src = TOKENS[this.fromToken].icon;
    document.getElementById('from-token-symbol').textContent = this.fromToken;
    document.getElementById('from-token-name').textContent = TOKENS[this.fromToken].name;

    // Update to token  
    document.getElementById('to-token-icon').src = TOKENS[this.toToken].icon;
    document.getElementById('to-token-symbol').textContent = this.toToken;
    document.getElementById('to-token-name').textContent = TOKENS[this.toToken].name;

    // Update rate
    this.updateRate();
    
    // Update mock balances
    document.getElementById('from-balance').textContent = '12.5423';
    document.getElementById('to-balance').textContent = '1,250.00';
  }

  updateRate() {
    const fromPrice = this.prices[this.fromToken] || 0;
    const toPrice = this.prices[this.toToken] || 0;
    
    if (fromPrice && toPrice) {
      const rate = fromPrice / toPrice;
      const rateText = `1 ${this.fromToken} = ${rate.toLocaleString('en-US', {
        maximumFractionDigits: rate < 1 ? 6 : 2
      })} ${this.toToken}`;
      document.getElementById('rate-text').textContent = rateText;
      document.getElementById('summary-rate').textContent = rateText;
    }
  }

  calculateToAmount(fromAmount) {
    const amount = parseFloat(fromAmount) || 0;
    const fromPrice = this.prices[this.fromToken] || 0;
    const toPrice = this.prices[this.toToken] || 0;
    
    if (amount && fromPrice && toPrice) {
      const toAmount = (amount * fromPrice) / toPrice;
      document.getElementById('to-amount').value = toAmount.toFixed(6);
      
      // Update USD values
      const fromUSD = amount * fromPrice;
      const toUSD = toAmount * toPrice;
      
      document.getElementById('from-usd-value').textContent = `≈ $${fromUSD.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
      
      document.getElementById('to-usd-value').textContent = `≈ $${toUSD.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

      // Update button state
      this.updateSwapButton(amount > 0);
      
      // Show transaction summary if amount > 0
      if (amount > 0) {
        document.getElementById('transaction-summary').style.display = 'block';
        this.updateTransactionSummary(fromUSD);
      } else {
        document.getElementById('transaction-summary').style.display = 'none';
      }
    } else {
      document.getElementById('to-amount').value = '';
      document.getElementById('from-usd-value').textContent = '≈ $0.00';
      document.getElementById('to-usd-value').textContent = '≈ $0.00';
      document.getElementById('transaction-summary').style.display = 'none';
      this.updateSwapButton(false);
    }
  }

  updateSwapButton(hasAmount) {
    const button = document.getElementById('swap-button');
    const buttonText = document.getElementById('button-text');
    
    if (hasAmount) {
      button.disabled = false;
      buttonText.textContent = `Swap ${this.fromToken} for ${this.toToken}`;
      this.hideError();
    } else {
      button.disabled = true;
      buttonText.textContent = 'Enter amount';
    }
  }

  updateTransactionSummary(usdValue) {
    // Mock network fee based on USD value
    const networkFee = Math.max(5, usdValue * 0.003);
    document.getElementById('network-fee').textContent = `~$${networkFee.toFixed(2)}`;
    
    // Route info
    const routeInfo = this.fromToken === 'USDC' || this.toToken === 'USDC' ? 
      'Direct swap' : `${this.fromToken} → USDC → ${this.toToken}`;
    document.getElementById('route-info').textContent = routeInfo;
  }

  swapTokens() {
    [this.fromToken, this.toToken] = [this.toToken, this.fromToken];
    
    // Clear amounts
    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    
    this.updateUI();
    
    // Add animation class
    const arrow = document.getElementById('swap-arrow');
    arrow.style.transform = 'rotate(180deg) scale(1.1)';
    setTimeout(() => {
      arrow.style.transform = '';
    }, 300);
  }

  setMaxAmount() {
    // Mock max balance
    const maxBalance = 12.5423;
    document.getElementById('from-amount').value = maxBalance;
    this.calculateToAmount(maxBalance);
  }

  openTokenModal(type) {
    this.currentModal = type;
    this.populateTokenList();
    document.getElementById('token-modal').style.display = 'flex';
    document.getElementById('token-search').value = '';
    document.getElementById('token-search').focus();
  }

  closeModal() {
    document.getElementById('token-modal').style.display = 'none';
    this.currentModal = null;
  }

  populateTokenList() {
    const tokenList = document.getElementById('token-list');
    tokenList.innerHTML = '';

    Object.entries(TOKENS).forEach(([symbol, token]) => {
      if (symbol === (this.currentModal === 'from' ? this.toToken : this.fromToken)) {
        return; // Skip current opposite token
      }

      const option = document.createElement('div');
      option.className = 'token-option';
      option.innerHTML = `
        <img src="${token.icon}" alt="${symbol}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23667eea%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2212%22>${symbol.slice(0,3)}</text></svg>'">
        <div class="token-option-info">
          <div class="token-option-symbol">${symbol}</div>
          <div class="token-option-name">${token.name}</div>
        </div>
        <div class="token-option-balance">
          ${Math.random() * 1000 < 10 ? '0.00' : (Math.random() * 1000).toFixed(2)}
        </div>
      `;

      option.addEventListener('click', () => {
        this.selectToken(symbol);
      });

      tokenList.appendChild(option);
    });
  }

  filterTokens(searchTerm) {
    const options = document.querySelectorAll('.token-option');
    const term = searchTerm.toLowerCase();

    options.forEach(option => {
      const symbol = option.querySelector('.token-option-symbol').textContent.toLowerCase();
      const name = option.querySelector('.token-option-name').textContent.toLowerCase();
      
      if (symbol.includes(term) || name.includes(term)) {
        option.style.display = 'flex';
      } else {
        option.style.display = 'none';
      }
    });
  }

  selectToken(symbol) {
    if (this.currentModal === 'from') {
      this.fromToken = symbol;
    } else {
      this.toToken = symbol;
    }
    
    this.updateUI();
    this.closeModal();
    
    // Recalculate if there's an amount
    const fromAmount = document.getElementById('from-amount').value;
    if (fromAmount) {
      this.calculateToAmount(fromAmount);
    }
  }

  toggleRate() {
    const fromPrice = this.prices[this.fromToken] || 0;
    const toPrice = this.prices[this.toToken] || 0;
    
    if (fromPrice && toPrice) {
      const currentText = document.getElementById('rate-text').textContent;
      
      if (currentText.includes(`1 ${this.fromToken}`)) {
        // Show reverse rate
        const rate = toPrice / fromPrice;
        const rateText = `1 ${this.toToken} = ${rate.toLocaleString('en-US', {
          maximumFractionDigits: rate < 1 ? 6 : 2
        })} ${this.fromToken}`;
        document.getElementById('rate-text').textContent = rateText;
      } else {
        // Show normal rate
        this.updateRate();
      }
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
  }

  hideError() {
    document.getElementById('error-message').style.display = 'none';
  }

  async executeSwap() {
    const fromAmount = parseFloat(document.getElementById('from-amount').value);
    
    if (!fromAmount || fromAmount <= 0) {
      this.showError('Please enter a valid amount');
      return;
    }

    // Validation checks
    if (fromAmount > 12.5423) { // Mock balance
      this.showError('Insufficient balance');
      return;
    }

    if (fromAmount < 0.001) {
      this.showError('Amount too small');
      return;
    }

    // Show loading state
    this.setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success feedback
      this.showSuccessMessage();
      this.resetForm();
      
    } catch (error) {
      this.showError('Swap failed. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    const button = document.getElementById('swap-button');
    
    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  showSuccessMessage() {
    // Create success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4ade80, #22c55e);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 400px;
    `;
    
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <div>
        <div style="font-weight: 600;">Swap Successful!</div>
        <div style="font-size: 14px; opacity: 0.9;">Transaction confirmed in 2 blocks</div>
      </div>
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  }

  resetForm() {
    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    document.getElementById('from-usd-value').textContent = '≈ $0.00';
    document.getElementById('to-usd-value').textContent = '≈ $0.00';
    document.getElementById('transaction-summary').style.display = 'none';
    this.updateSwapButton(false);
  }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SwapApp();
});
