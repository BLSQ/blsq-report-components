/* 
by default show the print button (the isPrintable was added lately on the invoice descriptor, we want existing invoices to be printable) 
except if the invoiceType has isPrintable === false
*/

export const isPrintable = (invoiceType) => {
  return !!(
    invoiceType &&
    (invoiceType.isPrintable === undefined || (invoiceType.isPrintable && invoiceType.isPrintable !== false))
  );
};
