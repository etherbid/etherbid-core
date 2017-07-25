module.exports = {
  migrations_directory: "./migrations",
  networks: {
    "testrpc": {
    	host: "localhost",
    	port: 8545,
    	network_id: "*" // Match any network id
    },
    "ethereum": {
    	host: "localhost",
    	port: 18545,
    	network_id: 1,
    },
    "morden": {
    	host: "localhost",
    	port: 28545,
    	network_id: 2,
    },
    "ropsten": {
    	host: "localhost",
    	port: 38545,
    	network_id: 3,
    },    
    "rinkeby": {
    	host: "localhost",
    	port: 48545,
    	network_id: 4,
    	from: '0x0ec696187cb52E69C54E212B480E0998ef41056A',
    }
  }
};