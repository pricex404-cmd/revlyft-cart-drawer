
export const sanitizeShopDomain = (domain) => {
    if (!domain) return '';
    return domain.replace(/\./g, '_');
};
