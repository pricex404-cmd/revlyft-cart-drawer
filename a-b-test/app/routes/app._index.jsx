import { useEffect, useState } from "react";
import { useFetcher, useNavigate, useSearchParams, useLoaderData } from "@remix-run/react";
import { v4 as uuidv4 } from 'uuid';
import { handleProductDetailActivateDeactivate } from "../functions/productdetails";
import { sanitizeShopDomain } from "../utils/sanitizeShopDomain";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  TextField,
  Select,
  DataTable,
  Icon,
  Modal,
  LegacyStack,
  Badge,
  Banner,
} from "@shopify/polaris";
import {
  ViewIcon,
  SearchIcon,
  CurrencyConvertIcon,
  DeliveryIcon,
  SandboxIcon,
  DiscountFilledIcon,
  DeleteIcon
} from '@shopify/polaris-icons';
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { deactivateAllActivePriceTests, deactivateAllActiveDiscountTests } from "../functions/discount";
import { CREATE_PRODUCT_POPULATE, UPDATE_PRODUCT_VARIANTS_BULK } from "../utils/graphqlQueries";
const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    CREATE_PRODUCT_POPULATE,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    UPDATE_PRODUCT_VARIANTS_BULK,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

// Components
const TestTypeButton = ({ type, icon, title, description, isSelected, onSelect }) => (
  <Button
    onClick={() => onSelect(type)}
    pressed={isSelected}
    fullWidth
    textAlign="left"
  >
    <BlockStack gap="200">
      <InlineStack gap="300">
        <div style={{ color: isSelected ? 'var(--p-color-text-success)' : 'var(--p-color-text-info)' }}>
          <Icon source={icon} />
        </div>
        <Text variant="headingMd" as="h2">{title}</Text>
      </InlineStack>
      <Text variant="bodyMd" as="p" color="subdued">
        {description}
      </Text>
    </BlockStack>
  </Button>
);

// Import timer utilities
import { getTimerDisplayData, createNewSession, closeOpenSessions } from "../functions/timer";

// Real-time Runtime Display Component
const RuntimeDisplay = ({ sessions, status }) => {
  const [displayTime, setDisplayTime] = useState('0h 0m');

  useEffect(() => {
    const updateDisplay = () => {
      const timerData = getTimerDisplayData(sessions, status);
      setDisplayTime(timerData.displayTime);
    };

    // Update immediately
    updateDisplay();

    // Set up interval only if timer should update
    const timerData = getTimerDisplayData(sessions, status);
    if (timerData.shouldUpdate) {
      const interval = setInterval(updateDisplay, 1000);
      return () => clearInterval(interval);
    }
  }, [sessions, status]);

  return (
    <span style={{ color: status === 'active' ? '#4caf50' : 'inherit', fontWeight: status === 'active' ? '500' : 'normal' }}>
      {displayTime}
    </span>
  );
};

const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  testTypeFilter,
  onTestTypeFilterChange,
  onClearFilters
}) => (
  <Card>
    <BlockStack gap="400">
      <InlineStack align="start" gap="200">
        <div style={{ flex: 1 }}>
          <TextField
            placeholder="Enter Test Name or ID"
            prefix={<Icon source={SearchIcon} />}
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <Select
          label="Status"
          labelHidden
          options={[
            { label: 'All Status', value: 'all' },
            { label: 'active', value: 'active' },
            { label: 'pending', value: 'pending' },
            { label: 'deactive', value: 'deactive' }
          ]}
          value={statusFilter}
          onChange={onStatusFilterChange}
        />


        <Select
          label="Test Type"
          labelHidden
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'Price Test', value: 'pricing' }
            // { label: 'Shipping Test', value: 'shipping' },
            // { label: 'Discount Test', value: 'discount' },
            // { label: 'Product Details Test', value: 'productDetails' },
            // { label: 'Offers Test', value: 'offers' }
          ]}
          value={testTypeFilter}
          onChange={onTestTypeFilterChange}
        />


        <Button plain onClick={onClearFilters}>CLEAR</Button>
      </InlineStack>
    </BlockStack>
  </Card>
);

const TestsTable = ({ rows, testSessionsData, testIds }) => {
  // Helper function to render status with appropriate color
  const renderStatus = (status) => {
    const statusStyles = {
      active: {
        backgroundColor: 'rgb(205, 241, 227)',
        color: 'rgb(0, 128, 96)',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500'
      },
      pending: {
        backgroundColor: 'rgb(255, 250, 230)',
        color: 'rgb(183, 155, 0)',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500'
      },
      deactive: {
        backgroundColor: 'rgb(254, 234, 238)',
        color: 'rgb(207, 45, 83)',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500'
      }
    };

    const style = statusStyles[status.toLowerCase()] || statusStyles.pending;

    return (
      <div style={style}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  // Modify rows to include styled status and runtime display
  const formattedRows = rows.map((row, index) => {
    const newRow = [...row];
    const testId = testIds[index];
    const sessions = testSessionsData[testId] || [];
    const status = typeof row[3] === 'string' ? row[3] : 'pending';

    // Replace status with styled version
    if (typeof newRow[3] === 'string') {
      newRow[3] = renderStatus(newRow[3]);
    }

    // Replace runtime with RuntimeDisplay component
    newRow[1] = <RuntimeDisplay sessions={sessions} status={status} />;

    return newRow;
  });

  return (
    <Card padding="0">
      <DataTable
        columnContentTypes={[
          'text',
          'text',
          'text',
          'text',
          'text'
        ]}
        headings={[
          'EXPERIMENT NAME',
          'RUNTIME',
          'START',
          'STATUS',
          'ACTIONS'
        ]}
        rows={formattedRows}
      />
    </Card>
  );
};

const CreateTestModal = ({
  open,
  onClose,
  testName,
  setTestName,
  testDescription,
  setTestDescription,
  selectedTestType,
  onTestTypeSelect,
  onCreateTest,
  isCreating,
  validationMessage,
  setValidationMessage
}) => {
  const testTypes = [
    {
      type: 'pricing',
      icon: CurrencyConvertIcon,
      title: 'Price Test',
      description: 'Test the price of one or multiple products in your Shopify store.'
    },
    // {
    //   type: 'shipping',
    //   icon: DeliveryIcon,
    //   title: 'Shipping Test',
    //   description: 'Test the rates you charge for shipping, including free thresholds.'
    // },
    // {
    //   type: 'discount',
    //   icon: DiscountFilledIcon,
    //   title: 'Discount Test',
    //   description: 'Test different discount percentages on cart value across customer groups.'
    // },
    // {
    //   type: 'productDetails',
    //   icon: SandboxIcon,
    //   title: 'Product Details Test',
    //   description: 'Test the display contents on your Shopify store.'
    // },
    // {
    //   type: 'offers',
    //   icon: DiscountFilledIcon,
    //   title: 'Offers Test',
    //   description: 'Test different offers on your Shopify store.'
    // }
  ];

  return (
    <Modal
      open={open}
      onClose={() => !isCreating && onClose()}
      title="Create A New Test"
    >
      {validationMessage && (
        <div style={{ position: 'sticky', top: 0, zIndex: 9999, backgroundColor: 'white', borderBottom: '1px solid #e1e3e5' }}>
          <Modal.Section>
            <Banner 
              status="critical"
              onDismiss={() => setValidationMessage('')}
            >
              <p>{validationMessage}</p>
            </Banner>
          </Modal.Section>
        </div>
      )}
      <Modal.Section>
        <BlockStack gap="400">
          <TextField
            label="Name"
            autoComplete="off"
            value={testName}
            onChange={setTestName}
            placeholder="Enter test name"
          />

          <TextField
            label="Description"
            multiline={3}
            autoComplete="off"
            value={testDescription}
            onChange={setTestDescription}
            placeholder="Enter test description"
          />

          <BlockStack gap="400">
            <Text variant="bodyMd" as="p" fontWeight="bold">Select Test Type:</Text>
            <LegacyStack distribution="fillEvenly">
              {testTypes.map((test) => (
                <TestTypeButton
                  key={test.type}
                  type={test.type}
                  icon={test.icon}
                  title={test.title}
                  description={test.description}
                  isSelected={selectedTestType === test.type}
                  onSelect={onTestTypeSelect}
                />
              ))}
            </LegacyStack>
          </BlockStack>
        </BlockStack>
      </Modal.Section>
      <Modal.Section>
        <InlineStack align="end">
          <Button
            variant="primary"
            onClick={onCreateTest}
            loading={isCreating}
          >
            Create Test
          </Button>
        </InlineStack>
      </Modal.Section>
    </Modal>
  );
};

// Main Component
export default function Index() {
  const { shop } = useLoaderData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('pricing');
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]); // Store all rows for filtering
  const [testIds, setTestIds] = useState([]);
  const [allTestIds, setAllTestIds] = useState([]); // Store all test IDs for filtering
  const [testSessionsData, setTestSessionsData] = useState({}); // Store sessions data
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectCleanup, setShowDisconnectCleanup] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [testTypeFilter, setTestTypeFilter] = useState('all');
  const [searchAndFilterData, setSearchAndFilterData] = useState([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  // Function to sanitize shop domain for Firebase path


  // Fetch tests data from Firebase
  useEffect(() => {
    const fetchTests = async () => {
      try {
        if (!shop) return;

        const sanitizedDomain = sanitizeShopDomain(shop);
        const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}.json`);

        if (!response.ok) {
          throw new Error('Failed to fetch tests data');
        }

        const data = await response.json();
        console.log("data", data)

        if (data) {
          // Filter to only keep entries with proper test structure
          const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
            // Check if the value has the proper test structure
            if (value && typeof value === 'object' &&
              value.basicInfo &&
              value.analytics &&
              value.targeting &&
              value.testGroups &&
              Array.isArray(value.testGroups)) {
              acc[key] = value;
            }
            return acc;
          }, {});

          // Store test IDs separately for reference
          const testIds = Object.keys(filteredData);

          // Store sessions data
          const sessionsData = {};
          Object.entries(filteredData).forEach(([testId, test]) => {
            sessionsData[testId] = test.sessions || [];
          });
          setTestSessionsData(sessionsData);

          // Create an array of test data with all the information we might need for filtering
          const testDataForFiltering = Object.entries(filteredData).map(([testId, test]) => ({
            id: testId,
            name: test.basicInfo?.testName || 'Unnamed Test',
            type: test.basicInfo?.type || '',
            status: test.basicInfo?.status || '',
            createdAt: test.basicInfo?.createdAt || '',
            sessions: test.sessions || []
          }));

          setSearchAndFilterData(testDataForFiltering);

          // Check for product details test with status active or deactive
          const shouldShow = testDataForFiltering.some(
            test =>
              test.type === 'productDetails' &&
              (test.status === 'active' || test.status === 'deactive')
          );
          setShowDisconnectCleanup(shouldShow);

          const formattedRows = Object.entries(filteredData).map(([testId, test], index) => {
            const row = [
              test.basicInfo?.testName || 'Unnamed Test',
              '---', // Will be replaced with session time
              test.basicInfo?.createdAt || '-------',
              test.basicInfo?.status || '-------',
              '...'
            ];
            // Add sessions data to row for processing
            row.sessions = test.sessions || [];
            return row;
          });

          // Store all rows and IDs
          setAllRows(formattedRows);
          setAllTestIds(testIds);

          // Initial state is all rows
          setRows(formattedRows);
          setTestIds(testIds);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchTests();
  }, [shop]);

  // Apply search and filters
  useEffect(() => {
    if (searchAndFilterData.length === 0) return;

    // Apply filters and search
    let filteredIndices = [];

    searchAndFilterData.forEach((test, index) => {
      // Check if the test matches all filters
      let matchesSearch = true;
      let matchesStatus = true;
      let matchesType = true;

      // Apply search term filter
      if (searchTerm) {
        matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.id.toLowerCase().includes(searchTerm.toLowerCase());
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        matchesStatus = test.status === statusFilter;
      }

      // Apply test type filter
      if (testTypeFilter !== 'all') {
        matchesType = test.type === testTypeFilter;
      }

      // If all filters match, add this index to the filtered indices
      if (matchesSearch && matchesStatus && matchesType) {
        filteredIndices.push(index);
      }
    });

    // Update rows and testIds based on filtered indices
    const newRows = filteredIndices.map(index => allRows[index]);
    const newTestIds = filteredIndices.map(index => allTestIds[index]);

    setRows(newRows);
    setTestIds(newTestIds);
  }, [searchTerm, statusFilter, testTypeFilter, searchAndFilterData, allRows, allTestIds]);

  // Handlers for search and filters
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleTestTypeFilterChange = (value) => {
    setTestTypeFilter(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTestTypeFilter('all');
  };

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);

  // Effect to handle URL params
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleActionClick = (rowIndex) => {
    setActiveRowIndex(rowIndex);
    setIsActionModalOpen(true);
  };

  const handleEditClick = () => {
    if (activeRowIndex !== null && testIds[activeRowIndex]) {
      // Set loading state immediately
      setIsNavigating(true);
      const testId = testIds[activeRowIndex];

      // Navigate directly
      navigate(`/app/test/${testId}`);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (activeRowIndex !== null && testIds[activeRowIndex]) {
      try {
        setIsDeleting(true);
        const testId = testIds[activeRowIndex];
        const sanitizedDomain = sanitizeShopDomain(shop);

        // Get test data to check status and type
        const testResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);
        const testData = await testResponse.json();

        if (!testResponse.ok) {
          throw new Error('Failed to fetch test data');
        }

        // Handle product detail test deletion
        if (testData?.basicInfo?.type === 'productDetails') {
          // Call the product detail deletion API
          const deleteResponse = await fetch(`/api/delete-product-duplicates?testId=${testId}&shop=${shop}`, {
            method: 'DELETE'
          });

          if (!deleteResponse.ok) {
            const deleteData = await deleteResponse.json();
            throw new Error(deleteData.error || 'Failed to delete product duplicates');
          }
        } else {
          // Handle regular test deletion (pricing, shipping, etc.)
          if (testData?.basicInfo?.status === 'active' || testData?.basicInfo?.status === 'deactive') {
            const discountId = testData?.basicInfo?.discountId;
            if (discountId) {
              // Delete discounts using the discountId
              const deleteDiscountsResponse = await fetch(`/api/delete-discounts?discountId=${discountId}&shop=${shop}`, {
                method: 'DELETE'
              });

              const deleteDiscountsData = await deleteDiscountsResponse.json();

              if (!deleteDiscountsResponse.ok) {
                throw new Error(deleteDiscountsData.error || 'Failed to delete discounts');
              }
            }
          }
        }

        // Delete the test from Firebase
        const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete test');
        }

        // Remove the test from local state
        const newRows = [...rows];
        newRows.splice(activeRowIndex, 1);
        setRows(newRows);

        const newTestIds = [...testIds];
        newTestIds.splice(activeRowIndex, 1);
        setTestIds(newTestIds);

        shopify.toast.show("Test deleted successfully");
        setDeleteConfirmOpen(false);
        setIsActionModalOpen(false);
      } catch (error) {
        console.error('Error deleting test:', error);
        shopify.toast.show(error.message || "Failed to delete test", { isError: true });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCreateNewTest = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setTestName('');
    setTestDescription('');
    setSelectedTestType('');
    setValidationMessage('');
    // navigate('.');
  };

  const handleTestTypeSelect = (type) => {
    setSelectedTestType(type);
  };

  const handleCreateTest = async () => {
    // Validation check - collect all missing fields
    const missingFields = [];
    
    if (!testName.trim()) {
      missingFields.push("Test Name");
    }
    if (!testDescription.trim()) {
      missingFields.push("Test Description");
    }
    if (!selectedTestType) {
      missingFields.push("Test Type");
    }
    
    if (missingFields.length > 0) {
      const message = `Please complete the following required fields: ${missingFields.join(", ")}`;
      setValidationMessage(message);
      return;
    }

    try {
      setIsCreating(true);
      const testId = uuidv4();
      const timestamp = new Date().toISOString();
      const sanitizedDomain = sanitizeShopDomain(shop);

      // Fetch shop currency dynamically
      let shopCurrency = ""; // Default fallback
      try {
        const currencyResponse = await fetch('/api/shop-currency');
        const currencyData = await currencyResponse.json();
        if (currencyResponse.ok && currencyData.currencyCode) {
          shopCurrency = currencyData.currencyCode;
        }
        console.log("shopCurrency", shopCurrency)
      } catch (error) {
        console.error('Failed to fetch shop currency:', error);
      }

      // Deactivate all active tests first
      // await deactivateAllActivePriceTests(sanitizedDomain, shop);

      // Create initial test data structure
      const testData = {
        basicInfo: {
          testName,
          testDescription,
          type: selectedTestType,
          status: "pending",
          createdAt: timestamp,
          updatedAt: timestamp,
          currency: shopCurrency
        },
        testGroups: [
          {
            id: 1,
            name: 'Control Group',
            percentage: 50,
            color: '#0040FF',
            products: {},
            analytics: {
              views: {},
              addToCart: {},
              saleDone: {}
            }
          },
          {
            id: 2,
            name: 'New Group 1',
            percentage: 50,
            color: '#00A47C',
            products: {},
            analytics: {
              views: {},
              addToCart: {},
              saleDone: {}
            }
          }
        ],
        targeting: {
          deviceType: "all",
          visitorType: "all",
          trafficSource: "all"
        },
        analytics: {
          conversionType: 'all',
          primaryMetric: 'conversion'
        },
        sessions: [] // Initialize empty sessions array as separate top-level node
      };

      // Save to Firebase
      const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        throw new Error('Failed to create test');
      }

      // Create query parameters
      const searchParams = new URLSearchParams({
        action: 'new',
        type: selectedTestType,
        tab: 'testGroups',
        name: testName,
        description: testDescription
      });

      // Navigate to the dynamic test route with both testId and query parameters
      navigate(`/app/test/${testId}?${searchParams.toString()}`);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating test:', error);
      shopify.toast.show("Failed to create test", { isError: true });
      setIsCreating(false);
    }
  };

  const isCreateButtonDisabled = !testName.trim() || !testDescription.trim() || !selectedTestType;

  // Function to modify rows to include an action button
  const modifyRowsWithActions = () => {
    return rows.map((row, index) => {
      // Create a new row with all existing elements
      const newRow = [...row];

      // Replace the last element (which is "..." based on your description) with a button
      newRow[newRow.length - 1] = (
        <Button
          plain
          onClick={() => handleActionClick(index)}
        >
          ...
        </Button>
      );

      return newRow;
    });
  };

  // Add an effect to reset all navigation states
  useEffect(() => {
    return () => {
      // Cleanup function to reset state if component unmounts
      setIsNavigating(false);
      setIsCreating(false);
    };
  }, []);

  const handleActivateDeactivate = async () => {
    if (activeRowIndex !== null && testIds[activeRowIndex]) {
      try {
        setIsDeleting(true);
        const testId = testIds[activeRowIndex];
        const sanitizedDomain = sanitizeShopDomain(shop);
        const currentTime = new Date().toISOString();

        // Get test data to check status and get discountId
        const testResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);
        const testData = await testResponse.json();

        if (!testResponse.ok) {
          throw new Error('Failed to fetch test data');
        }

        const discountId = testData?.basicInfo?.discountId;
        if (!discountId) {
          throw new Error('No discount ID found for this test');
        }

        const currentStatus = testData?.basicInfo?.status;
        const action = currentStatus === 'active' ? 'deactivate' : 'activate';

        // Handle session tracking
        let updatedSessions = testData?.sessions || [];

        if (action === 'activate') {
          // Deactivate all other active tests first based on test type
          const testType = testData?.basicInfo?.type;
          if (testType === 'pricing') {
            await deactivateAllActivePriceTests(sanitizedDomain, shop, testId);
          } else if (testType === 'discount') {
            await deactivateAllActiveDiscountTests(sanitizedDomain, shop, testId);
          }
          // Note: Other test types like 'productDetails' don't need discount deactivation

          // Start new session
          const newSession = createNewSession('reactivation');
          updatedSessions.push(newSession);
        } else {
          // End current active session
          updatedSessions = closeOpenSessions(updatedSessions, currentTime);
        }

        // Call the activate/deactivate API
        const response = await fetch(`/api/mutate-discount?discountId=${discountId}&shop=${shop}&action=${action}`, {
          method: 'POST'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to ${action} discount`);
        }

        // Update the test status and sessions in Firebase
        const newStatus = action === 'activate' ? 'active' : 'deactive';
        const updatedTestData = {
          ...testData,
          basicInfo: {
            ...testData.basicInfo,
            status: newStatus,
            lastStatusChange: currentTime
          },
          sessions: updatedSessions
        };

        const updateResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTestData)
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update test data');
        }

        // Update sessions data state
        setTestSessionsData(prev => ({
          ...prev,
          [testId]: updatedSessions
        }));

        // Update the local state - only deactivate tests of the same type
        const testType = testData?.basicInfo?.type;
        const newRows = rows.map((row, index) => {
          if (index === activeRowIndex) {
            const updatedRow = [...row.slice(0, 3), newStatus, ...row.slice(4)];
            updatedRow.sessions = updatedSessions;
            return updatedRow;
          }

          // Only deactivate tests of the same type when activating a new test
          if (action === 'activate' && row[3] === 'active') {
            const currentRowTestId = testIds[index];
            const currentRowTestData = searchAndFilterData.find(test => test.id === currentRowTestId);

            // Only deactivate if it's the same test type
            if (currentRowTestData && currentRowTestData.type === testType) {
              const deactivatedRow = [...row.slice(0, 3), 'deactive', ...row.slice(4)];
              return deactivatedRow;
            }
          }

          return row;
        });
        setRows(newRows);

        // Also update allRows and searchAndFilterData for consistency
        if (action === 'activate') {
          // Update allRows
          const newAllRows = allRows.map((row, index) => {
            const currentRowTestId = allTestIds[index];
            if (currentRowTestId === testId) {
              const updatedRow = [...row.slice(0, 3), newStatus, ...row.slice(4)];
              updatedRow.sessions = updatedSessions;
              return updatedRow;
            }

            // Deactivate tests of the same type
            if (row[3] === 'active') {
              const currentRowTestData = searchAndFilterData.find(test => test.id === currentRowTestId);
              if (currentRowTestData && currentRowTestData.type === testType) {
                return [...row.slice(0, 3), 'deactive', ...row.slice(4)];
              }
            }

            return row;
          });
          setAllRows(newAllRows);

          // Update searchAndFilterData
          const newSearchAndFilterData = searchAndFilterData.map(test => {
            if (test.id === testId) {
              return { ...test, status: newStatus, sessions: updatedSessions };
            }

            // Deactivate tests of the same type
            if (test.status === 'active' && test.type === testType) {
              return { ...test, status: 'deactive' };
            }

            return test;
          });
          setSearchAndFilterData(newSearchAndFilterData);
        } else {
          // For deactivation, only update the current test
          const newAllRows = allRows.map((row, index) => {
            const currentRowTestId = allTestIds[index];
            if (currentRowTestId === testId) {
              const updatedRow = [...row.slice(0, 3), newStatus, ...row.slice(4)];
              updatedRow.sessions = updatedSessions;
              return updatedRow;
            }
            return row;
          });
          setAllRows(newAllRows);

          const newSearchAndFilterData = searchAndFilterData.map(test => {
            if (test.id === testId) {
              return { ...test, status: newStatus, sessions: updatedSessions };
            }
            return test;
          });
          setSearchAndFilterData(newSearchAndFilterData);
        }

        shopify.toast.show(`Test ${action}d successfully`);
        setIsActionModalOpen(false);
      } catch (error) {
        console.error('Error in handleActivateDeactivate:', error);
        const errorMessage = error.message || 'An unexpected error occurred';
        shopify.toast.show(errorMessage, { isError: true });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Manual Disconnect & Clean Up handler
  const handleManualDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      if (!shop) throw new Error('Shop not found');
      const sanitizedDomain = sanitizeShopDomain(shop);
      // Fetch all tests
      const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}.json`);
      if (!response.ok) throw new Error('Failed to fetch tests');
      const tests = await response.json();

      // Find all productDetails tests that are not pending
      const productDetailsTests = Object.entries(tests || {}).filter(
        ([, test]) => test?.basicInfo?.type === 'productDetails' && test?.basicInfo?.status !== 'pending'
      );

      if (productDetailsTests.length === 0) {
        shopify.toast.show('No active or deactive tests to clean up');
        return;
      }

      // Collect test IDs that will be updated
      const updatedTestIds = productDetailsTests.map(([testId]) => testId);

      // Run cleanup for each test
      for (const [testId] of productDetailsTests) {
        const res = await fetch(`/api/cleanup-product-dublicates?testId=${testId}&shop=${shop}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to clean up test ${testId}`);
        }
      }

      // Update all states after all API calls are complete
      // Update rows state
      const newRows = rows.map((row, index) => {
        const currentTestId = testIds[index];
        if (updatedTestIds.includes(currentTestId)) {
          return [...row.slice(0, 3), 'pending', ...row.slice(4)];
        }
        return row;
      });
      setRows(newRows);

      // Update allRows state
      const newAllRows = allRows.map((row, index) => {
        const currentTestId = allTestIds[index];
        if (updatedTestIds.includes(currentTestId)) {
          return [...row.slice(0, 3), 'pending', ...row.slice(4)];
        }
        return row;
      });
      setAllRows(newAllRows);

      // Update searchAndFilterData state
      const newSearchAndFilterData = searchAndFilterData.map(test => {
        if (updatedTestIds.includes(test.id)) {
          return { ...test, status: 'pending' };
        }
        return test;
      });
      setSearchAndFilterData(newSearchAndFilterData);

      // Hide the disconnect cleanup button
      setShowDisconnectCleanup(false);

      shopify.toast.show('Cleanup successful! You can now uninstall the app.');
    } catch (error) {
      shopify.toast.show(error.message || 'Cleanup failed', { isError: true });
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Handler for disconnect confirmation modal
  const handleDisconnectClick = () => {
    setDisconnectConfirmOpen(true);
  };

  const handleDisconnectConfirm = () => {
    setDisconnectConfirmOpen(false);
    handleManualDisconnect();
  };

  // Copy script functionality
  const handleCopyScript = async () => {
    const scriptTemplate = `<!-- Revlyf A/B Testing Script -->
<script src="https://app.revlyft.com/assets/revlyf-price-query-selector-script.js?shop=${shop}" defer></script>
<script src="https://app.revlyft.com/assets/revlyf-abtest-script.js?shop=${shop}" defer></script>
<script src="https://app.revlyft.com/assets/revlyf-discount-abtest-script.js?shop=${shop}" defer></script>`;
    console.log("scriptTemplate", scriptTemplate);
    try {
      await navigator.clipboard.writeText(scriptTemplate);
      setIsCopied(true);
      shopify.toast.show("Script copied to clipboard! Ready to use with your store domain.");

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy script: ', err);
      shopify.toast.show("Failed to copy script", { isError: true });
    }
  };

  return (
    <Page>
      <BlockStack gap="500">
        {/* Header Section */}
        <InlineStack align="space-between">
          <Text variant="headingLg" as="h1">A/B Tests Overview:</Text>
          <InlineStack gap="200">
            {/* <Button>✨ TestPilot</Button> */}
            {showDisconnectCleanup && (
              <Button onClick={handleDisconnectClick}>Disconnect & Clean Up</Button>
            )}
            <Button variant="primary" onClick={handleCreateNewTest}>Create New Test</Button>
          </InlineStack>
        </InlineStack>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          testTypeFilter={testTypeFilter}
          onTestTypeFilterChange={handleTestTypeFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Tests Table */}
        <TestsTable rows={rows.length > 0 ? modifyRowsWithActions() : []} testSessionsData={testSessionsData} testIds={testIds} />

        {/* Revlyf Script Installation Instructions */}
        {/* <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Revlyf Script Installation</Text>
            <Text variant="bodyMd" color="subdued">
              To enable A/B testing functionality, you need to install the Revlyf script in your theme.
            </Text>

            <BlockStack gap="300">
              <Text variant="headingMd" as="h3">Steps:</Text>
              <List type="number">
                <List.Item>
                  Copy the ready-to-use script below (automatically configured for your store: <code>{shop}</code>)
                </List.Item>
                <List.Item>
                  Add the script to your theme's <code>theme.liquid</code> file before the closing <code>&lt;/head&gt;</code> tag
                </List.Item>
                <List.Item>
                  Save your changes - your A/B testing functionality will be active immediately!
                </List.Item>
              </List>
            </BlockStack>

            <BlockStack gap="200">
              <Text variant="headingMd" as="h3">Your Revlyf Script:</Text>
              <Text variant="bodyMd" color="subdued">
                <strong>Ready to use:</strong> This script is automatically configured for your store: <Text as="span" fontFamily="mono" fontWeight="bold">{shop}</Text>
              </Text>
              <Card sectioned>
                <BlockStack gap="300">
                  <Text variant="bodyMd" as="pre" fontFamily="mono">
                    {`<!-- Revlyf A/B Testing Script -->
<script src="https://app.revlyft.com/assets/revlyf-price-query-selector-script.js?shop=${shop}" defer></script>
<script src="https://app.revlyft.com/assets/revlyf-abtest-script.js?shop=${shop}" defer></script>`}
                  </Text>
                  <InlineStack align="end">
                    <Button
                      onClick={handleCopyScript}
                      variant={isCopied ? "success" : "primary"}
                      size="small"
                    >
                      {isCopied ? "Copied!" : "Copy Code"}
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </BlockStack>
        </Card> */}

        {/* Create New Test Modal */}
        <CreateTestModal
          open={isCreateModalOpen}
          onClose={handleCloseModal}
          testName={testName}
          setTestName={(value) => {
            setTestName(value);
            if (validationMessage) setValidationMessage('');
          }}
          testDescription={testDescription}
          setTestDescription={(value) => {
            setTestDescription(value);
            if (validationMessage) setValidationMessage('');
          }}
          selectedTestType={selectedTestType}
          onTestTypeSelect={(type) => {
            setSelectedTestType(type);
            if (validationMessage) setValidationMessage('');
          }}
          onCreateTest={handleCreateTest}
          isCreating={isCreating}
          validationMessage={validationMessage}
          setValidationMessage={setValidationMessage}
        />

        {/* Action Modal */}
        <Modal
          open={isActionModalOpen}
          onClose={() => !isNavigating && setIsActionModalOpen(false)}
          title="Test Actions"
          primaryAction={{
            content: activeRowIndex !== null && rows[activeRowIndex]?.[3] === 'pending' ? 'Edit Test' : 'Show Test',
            onAction: handleEditClick,
            loading: isNavigating,
            disabled: isNavigating
          }}
          secondaryActions={[
            // Only show activate/deactivate button if status is not pending
            ...(activeRowIndex !== null && rows[activeRowIndex]?.[3] !== 'pending' ? [{
              content: rows[activeRowIndex]?.[3] === 'active' ? 'Deactivate Test' : 'Activate Test',
              onAction: async () => {
                const testId = testIds[activeRowIndex];
                const sanitizedDomain = sanitizeShopDomain(shop);
                const testResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);
                const testData = await testResponse.json();

                if (testData?.basicInfo?.type === 'productDetails') {
                  await handleProductDetailActivateDeactivate(testIds, activeRowIndex, shop, rows, setRows, setIsActionModalOpen, setIsDeleting);
                } else {
                  await handleActivateDeactivate();
                }
              },
              loading: isDeleting,
              disabled: isDeleting
            }] : []),
            {
              content: 'Delete Test',
              destructive: true,
              onAction: handleDeleteClick,
              disabled: isNavigating
            },
            {
              content: 'Cancel',
              onAction: () => setIsActionModalOpen(false),
              disabled: isNavigating
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Manage A/B Test</Text>
              <Text>
                You can edit this test to modify its configuration, view detailed analytics, or change test parameters.
              </Text>
              {activeRowIndex !== null && rows[activeRowIndex] && (
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="bold">Test Details:</Text>
                  <Text variant="bodyMd">Name: {rows[activeRowIndex][0]}</Text>
                  <Text variant="bodyMd">Status: {rows[activeRowIndex][3]}</Text>
                </BlockStack>
              )}
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Confirm Deletion"
          primaryAction={{
            content: 'Delete Test',
            destructive: true,
            loading: isDeleting,
            onAction: handleDeleteConfirm,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setDeleteConfirmOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2" color="critical">Delete A/B Test</Text>
              <Text>
                Are you sure you want to delete this test? This action cannot be undone.
              </Text>
              {activeRowIndex !== null && rows[activeRowIndex] && (
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="bold">Test to delete:</Text>
                  <Text variant="bodyMd">Name: {rows[activeRowIndex][0]}</Text>
                </BlockStack>
              )}
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* Disconnect Confirmation Modal */}
        <Modal
          open={disconnectConfirmOpen}
          onClose={() => setDisconnectConfirmOpen(false)}
          title="Disconnect & Clean Up"
          primaryAction={{
            content: 'Yes',
            onAction: handleDisconnectConfirm,
            loading: isDisconnecting,
            disabled: isDisconnecting,
          }}
          secondaryActions={[
            {
              content: 'No',
              onAction: () => setDisconnectConfirmOpen(false),
              disabled: isDisconnecting,
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Confirm Disconnect & Clean Up</Text>
              <Text>
                This will clean up all test products and data from your store. Are you sure you want to proceed?
              </Text>
              <Text variant="bodyMd" color="subdued">
                This action is recommended before uninstalling the app to ensure all test products are removed from your store.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>


      </BlockStack>
    </Page>
  );
}
