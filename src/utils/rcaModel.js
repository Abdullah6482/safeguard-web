export function createRcaNode(stepNumber, whyText = '', answerText = '') {
  return {
    step: stepNumber,
    why: whyText,
    answer: answerText,
    isRootCause: stepNumber === 5,
  };
}

export function validateRcaChain(chain = []) {
  if (chain.length === 0) return false;
  return chain.every(n => (n.answer || '').trim().length > 3);
}
