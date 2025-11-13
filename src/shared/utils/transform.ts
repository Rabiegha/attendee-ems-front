// Transform utilities from original badge generator

export const getTransformWithRotation = (rotation: number, baseTransform: string = ''): string => {
  // Remove any existing rotate transform
  let newTransform = baseTransform === 'none' ? '' : baseTransform;
  newTransform = newTransform.replace(/rotate\([^)]*\)/g, '');
  
  // Add the new rotation (use rotate() like the old system, NOT scale())
  if (newTransform === '') {
    return `rotate(${rotation}deg)`;
  } else {
    return `${newTransform.trim()} rotate(${rotation}deg)`;
  }
};