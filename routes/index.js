const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const massage = {
    success: {status: 200, text: 'Block successfully created'},
    error: {status: 404, text: 'Block failed validation'}
};

class Block {
    indexBlock;
    hashPreviousBlock;
    timestamp;
    data;
    hash;

    constructor(data, indexBlock = 0, hashPreviousBlock = null) {
        this.indexBlock = indexBlock;
        this.hashPreviousBlock = hashPreviousBlock;
        this.timestamp = new Date().getTime();
        this.data = data;
        this.hash = this.generateHashBlock();
    }

    generateHashBlock() {
        const data = this.indexBlock + this.hashPreviousBlock + this.timestamp + this.data;
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

const generateGenesisBlock = () => {
    return new Block('data');
};

const blockChainArray = [generateGenesisBlock()];

const addBlock = (data, mode) => {
    const newBlock = generateNewBlock(data);
    const notValidNewBlock = addNotValidBlock(data);

    if (!validateBlock(mode ? newBlock : notValidNewBlock)) return massage.error;

    blockChainArray.push(newBlock);
    return massage.success;
};

const generateNewBlock = (data) => {
    const indexBlock = blockChainArray.length;
    const hashPreviousBlock = getPreviousBlock().hash;
    return new Block(data, indexBlock, hashPreviousBlock);
};

const getPreviousBlock = () => {
    return blockChainArray[blockChainArray.length - 1];
};

const addNotValidBlock = (data) => {
    const indexBlock = blockChainArray.length;
    const hashPreviousBlock = 'nbhgjvhvhbghbhb';
    return new Block(data, indexBlock, hashPreviousBlock);
};

const validateBlock = (newBlock) => {
    const previousBlock = getPreviousBlock();
    if (previousBlock.hash !== newBlock.hashPreviousBlock) return false;
    if (previousBlock.indexBlock + 1 !== newBlock.indexBlock) return false;
    return newBlock.hash === newBlock.generateHashBlock();
};

const validateAllBlockChain = () => {
    let valid = false;
    blockChainArray.reduce((previousValue, currentValue) => {
        valid = previousValue === currentValue.hashPreviousBlock;
        previousValue = currentValue.hash;
        if (valid) return previousValue;
    }, null);

    return valid;
};

router.get('/', (req, res) => {
    res.render('index', {title: 'Express'});
});

router.get('/showAllChain', (req, res) => {
    res.send(blockChainArray);
});

router.post('/createBlock', (req, res) => {
    const response = addBlock(req.body.data, true);
    res.status(response.status).send(response.text);
});

router.post('/createNotValidBlock', (req, res) => {
    const response = addBlock(req.body.data, false);
    res.status(response.status).send(response.text);
});

module.exports = router;
