// Super simple test module
console.log('🧪 [TEST] Simple module loaded');

export const testFunction = () => {
  console.log('🧪 [TEST] Test function called');
  return 'Hello from test function!';
};

export const simpleConnectWallet = async () => {
  console.log('🧪 [TEST] Simple connect wallet called');
  return { test: true };
};
