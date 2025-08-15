import { useState, useCallback, useMemo } from "react";
import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
    Button,
    TextField,
    Thumbnail,
    InlineStack,
    BlockStack,
    Select,
    Filters
} from "@shopify/polaris";
import { formatMoney } from "../../../utils/formatMoney";

// Color theme
const colors = {
    primary: '#6B7280',
    primaryLight: '#F3F4F6',
};

export const ProductsList = ({
    products = [],
    selectedProducts = [],
    onProductSelect,
    onDone,
    isTestStarted,
    AllProductIdsInTests = [],
    multiVariantProductIds = [],
    compareAtPriceProductIds = [],
    currency
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortSelected, setSortSelected] = useState('product asc');
    const [variantTypeFilter, setVariantTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Early return for loading state
    if (!products || !Array.isArray(products) || products.length === 0) {
        return (
            <LegacyCard>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Text variant="headingMd" as="p">
                        Loading products...
                    </Text>
                </div>
            </LegacyCard>
        );
    }

    // Process products data for the table
    const processedProducts = useMemo(() => {

        return products.map((product) => {
            // Safety checks for product structure
            if (!product || !product.id) {
                return null;
            }

            const productId = product.id.split('/').pop();
            const isInOtherTest = AllProductIdsInTests && AllProductIdsInTests.includes(productId);
            const hasMultipleVariants = multiVariantProductIds && multiVariantProductIds.includes(productId);
            const hasCompareAtPrice = compareAtPriceProductIds && compareAtPriceProductIds.includes(productId);
            const isSelected = selectedProducts.some(p => p.productId === product.id);

            // Calculate price info
            let priceInfo = '';
            let originalPrice = 0;

            // Safety check for variants structure
            const variants = product.variants?.edges || [];

            if (hasMultipleVariants) {
                const allVariants = variants.map(edge => parseFloat(edge?.node?.price || '0'));
                const firstPrice = allVariants[0] || 0;
                const hasSamePrice = allVariants.every(price => price === firstPrice);

                if (hasSamePrice) {
                    priceInfo = `${variants.length} variants (all same price)`;
                    originalPrice = firstPrice;
                } else {
                    priceInfo = `${variants.length} variants (different prices)`;
                    originalPrice = Math.min(...allVariants);
                }
            } else {
                originalPrice = parseFloat(variants[0]?.node?.price || '0');
                priceInfo = 'Single variant';
            }

            return {
                id: product.id,
                title: product.title || 'Untitled Product',
                image: product.images?.edges?.[0]?.node?.url || '',
                variantType: hasMultipleVariants ? 'Multi-variant' : 'Single variant',
                variantCount: variants.length,
                priceInfo,
                originalPrice,
                formattedPrice: formatMoney(originalPrice, currency),
                status: hasCompareAtPrice ? 'Has Compare Price' :
                    isInOtherTest ? 'In Other Test' :
                        isSelected ? 'Selected' : 'Available',
                isInOtherTest,
                hasMultipleVariants,
                hasCompareAtPrice,
                isSelected,
                product // Store original product data
            };
        }).filter(Boolean); // Filter out null values
    }, [products, selectedProducts, AllProductIdsInTests, multiVariantProductIds, compareAtPriceProductIds, currency]);

    // Filter and sort logic
    const filteredProducts = useMemo(() => {
        let filtered = [...processedProducts];

        // Search filter
        if (searchValue) {
            const query = searchValue.toLowerCase();
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(query)
            );
        }

        // Variant type filter
        if (variantTypeFilter) {
            filtered = filtered.filter(product =>
                product.variantType === variantTypeFilter
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(product =>
                product.status === statusFilter
            );
        }

        // Sort
        const [sortKey, sortDirection] = sortSelected.split(' ');
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortKey) {
                case 'product':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'price':
                    aValue = a.originalPrice;
                    bValue = b.originalPrice;
                    break;
                case 'variants':
                    aValue = a.variantCount;
                    bValue = b.variantCount;
                    break;
                default:
                    return 0;
            }

            if (sortDirection === 'desc') {
                return aValue < bValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });

        return filtered;
    }, [processedProducts, searchValue, variantTypeFilter, statusFilter, sortSelected]);

    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    // Get currently selected product IDs for IndexTable
    const selectedResourceIds = selectedProducts.map(p => p.productId);

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(filteredProducts, selectedResourceIds);

    // Custom selection handler that syncs with parent state
    const handleCustomSelectionChange = useCallback((selectionType, toggleType, selection) => {
        console.log('Selection change:', { selectionType, toggleType, selection });

        if (selectionType === 'single') {
            // Handle single product selection - let parent component handle the logic
            const productId = selection;
            const product = filteredProducts.find(p => p.id === productId);

            if (product) {
                onProductSelect(product.product);
            }
        } else if (selectionType === 'all') {
            // Handle select all / deselect all - only include available products for bulk actions
            const availableProducts = filteredProducts.filter(product =>
                product.status === 'Available'
            );

            if (toggleType) {
                // Select all available products only
                availableProducts.forEach(product => {
                    if (!product.isSelected) {
                        onProductSelect(product.product);
                    }
                });
            } else {
                // Deselect all products (including previously selected ones with warnings)
                filteredProducts.forEach(product => {
                    if (product.isSelected) {
                        onProductSelect(product.product);
                    }
                });
            }
        } else if (selectionType === 'range') {
            // Handle range selection - let parent handle individual selections
            const [start, end] = selection;
            for (let i = start; i <= end; i++) {
                const product = filteredProducts[i];
                if (product && !product.isSelected) {
                    onProductSelect(product.product);
                }
            }
        }

        // Also call the original handler for internal state management
        handleSelectionChange(selectionType, toggleType, selection);
    }, [filteredProducts, onProductSelect, handleSelectionChange]);

    // Handle bulk selection
    const handleBulkSelection = useCallback((selectionType) => {
        const resourcesToSelect = filteredProducts.filter(product =>
            product.status === 'Available' && !product.isSelected
        );

        if (selectionType === 'all') {
            resourcesToSelect.forEach(product => {
                if (!product.isSelected) {
                    onProductSelect(product.product);
                }
            });
        }
    }, [filteredProducts, onProductSelect]);

    // Filter options
    const sortOptions = [
        { label: 'Product A-Z', value: 'product asc' },
        { label: 'Product Z-A', value: 'product desc' },
        { label: 'Price Low to High', value: 'price asc' },
        { label: 'Price High to Low', value: 'price desc' },
        { label: 'Variant Count Low to High', value: 'variants asc' },
        { label: 'Variant Count High to Low', value: 'variants desc' },
    ];

    const variantTypeOptions = [
        { label: 'All Types', value: '' },
        { label: 'Single variant', value: 'Single variant' },
        { label: 'Multi-variant', value: 'Multi-variant' },
    ];

    const statusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Available', value: 'Available' },
        { label: 'Selected', value: 'Selected' },
        { label: 'In Other Test', value: 'In Other Test' },
    ];

    // Row markup
    const rowMarkup = (filteredProducts || []).map((product, index) => {
        if (!product || !product.id) {
            return null;
        }

        const isDisabled = isTestStarted;

        const statusBadge = (() => {
            switch (product.status) {
                case 'Selected':
                    return <Badge status="success">Selected</Badge>;
                case 'Has Compare Price':
                    return <Badge status="critical">Has Compare Price</Badge>;
                case 'In Other Test':
                    return <Badge status="warning">In Other Test</Badge>;
                default:
                    return <Badge>Available</Badge>;
            }
        })();

        return (
            <IndexTable.Row
                id={product.id}
                key={product.id}
                selected={product.isSelected}
                position={index}
                disabled={isDisabled}
            >
                <IndexTable.Cell>
                    <InlineStack gap="300" align="start">
                        {product.image && (
                            <Thumbnail
                                source={product.image}
                                alt={product.title}
                                size="small"
                            />
                        )}
                        <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="semibold" as="span">
                                {product.title}
                            </Text>
                            <Text variant="bodySm" as="p" color="subdued">
                                {product.priceInfo}
                            </Text>
                        </BlockStack>
                    </InlineStack>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd">
                        {product.variantType}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd" alignment="end" numeric>
                        {product.variantCount}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd" alignment="end" numeric>
                        {product.formattedPrice}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {statusBadge}
                </IndexTable.Cell>
            </IndexTable.Row>
        );
    }).filter(Boolean); // Remove null rows

    return (
        <LegacyCard>
            <div style={{ padding: '16px 20px 0 20px' }}>
                <InlineStack align="space-between">
                    <Text variant="headingLg" as="h2">Select Products</Text>
                    <Button onClick={onDone} variant="primary">
                        Save Products ({selectedProducts.length})
                    </Button>
                </InlineStack>
            </div>

            <div style={{ padding: '16px 20px' }}>
                <BlockStack gap="300">
                    <TextField
                        placeholder="Search products..."
                        value={searchValue}
                        onChange={setSearchValue}
                        clearButton
                        onClearButtonClick={() => setSearchValue('')}
                    />

                    <InlineStack gap="300">
                        <div style={{ minWidth: '200px' }}>
                            <Select
                                label="Sort by"
                                options={sortOptions}
                                value={sortSelected}
                                onChange={setSortSelected}
                            />
                        </div>

                        <div style={{ minWidth: '150px' }}>
                            <Select
                                label="Variant Type"
                                options={variantTypeOptions}
                                value={variantTypeFilter}
                                onChange={setVariantTypeFilter}
                            />
                        </div>

                        <div style={{ minWidth: '150px' }}>
                            <Select
                                label="Status"
                                options={statusOptions}
                                value={statusFilter}
                                onChange={setStatusFilter}
                            />
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'flex-end',
                            minHeight: '60px',
                            paddingBottom: '4px'// Match the height of Select components
                        }}>
                            <Button
                                variant="primary"
                                
                                onClick={() => {
                                    setSearchValue('');
                                    setSortSelected('product asc');
                                    setVariantTypeFilter('');
                                    setStatusFilter('');
                                }}
                            >
                                Clear All
                            </Button>
                        </div>
                    </InlineStack>
                </BlockStack>
            </div>

            {/* Fixed height container for scrollable table */}
            <div style={{
                height: '400px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div style={{
                    height: '100%',
                    overflow: 'auto'
                }}>
                    <IndexTable
                        resourceName={resourceName}
                        itemCount={filteredProducts.length}
                        selectedItemsCount={selectedProducts.length}
                        onSelectionChange={handleCustomSelectionChange}
                        hasMoreItems={false}
                        selectable={!isTestStarted}
                        headings={[
                            { title: 'Product' },
                            { title: 'Type' },
                            { title: 'Variants', alignment: 'end' },
                            { title: 'Price', alignment: 'end' },
                            { title: 'Status' },
                        ]}
                        promotedBulkActions={[
                            {
                                content: 'Select Available Products',
                                onAction: () => handleBulkSelection('all'),
                            },
                        ]}
                        emptyState={
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Text variant="headingMd" as="p">
                                    No products found
                                </Text>
                                <Text variant="bodyMd" as="p" color="subdued">
                                    Try adjusting your search or filter criteria
                                </Text>
                            </div>
                        }
                    >
                        {rowMarkup}
                    </IndexTable>
                </div>
            </div>
        </LegacyCard>
    );
};

export default ProductsList; 