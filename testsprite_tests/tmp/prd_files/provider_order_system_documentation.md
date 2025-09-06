# প্রোভাইডার অর্ডার সিস্টেম - সম্পূর্ণ টেকনিক্যাল ডকুমেন্টেশন

## ১. সিস্টেম ওভারভিউ

SMMDOC প্রোভাইডার অর্ডার ট্র্যাকিং সিস্টেম একটি উন্নত অর্ডার ম্যানেজমেন্ট সিস্টেম যা বাহ্যিক প্রোভাইডারদের সাথে অর্ডার ফরওয়ার্ড করে এবং স্ট্যাটাস সিঙ্ক করে। এই সিস্টেমটি ইউজার এবং এডমিনদের জন্য আলাদা অর্ডার স্ট্যাটাস প্রদর্শন করে এবং ব্যালেন্স সমস্যার ক্ষেত্রে রিসাবমিট অপশন প্রদান করে।

## ২. বর্তমান সিস্টেমের অবস্থা

### ✅ সম্পন্ন কাজসমূহ

#### ২.১ ডেটাবেস স্কিমা ইন্টিগ্রেশন
- **Provider Table Integration**: প্রোভাইডার টেবিল সম্পূর্ণভাবে ইন্টিগ্রেট করা হয়েছে
- **Service-Provider Relations**: সার্ভিস এবং প্রোভাইডারের মধ্যে সম্পর্ক স্থাপন করা হয়েছে
- **Order Tracking Schema**: অর্ডার ট্র্যাকিং এর জন্য নতুন স্কিমা যোগ করা হয়েছে

#### ২.২ কোর কম্পোনেন্টস
- **ProviderOrderForwarder Class**: বাহ্যিক প্রোভাইডারদের সাথে যোগাযোগের জন্য ক্লাস তৈরি
- **Order Forwarding Logic**: অর্ডার ফরওয়ার্ডিং লজিক ইমপ্লিমেন্ট করা হয়েছে
- **Provider Order Logging**: প্রোভাইডার অর্ডার লগিং সিস্টেম তৈরি

#### ২.৩ API এন্ডপয়েন্টস
- **User Order Creation API**: ইউজার অর্ডার তৈরির API আপডেট করা হয়েছে
- **Provider Order Placement API**: প্রোভাইডারে অর্ডার পাঠানোর API তৈরি
- **Admin Sync API**: এডমিন প্যানেলে ম্যানুয়াল সিঙ্ক API
- **Cron Sync System**: অটোমেটিক স্ট্যাটাস সিঙ্ক সিস্টেম

#### ২.৪ এডমিন ইন্টারফেস
- **Admin Order Page**: এডমিন অর্ডার পেজে প্রোভাইডার স্ট্যাটাস দেখানো হচ্ছে
- **Manual Sync Option**: ম্যানুয়াল সিঙ্ক অপশন যোগ করা হয়েছে

### ❌ অসম্পূর্ণ/প্রয়োজনীয় কাজসমূহ

#### ২.৫ ইউজার ইন্টারফেস সমস্যা
- **User Status Display**: ইউজাররা এখনও ফেইল্ড স্ট্যাটাস দেখতে পাচ্ছে (শুধু পেন্ডিং দেখানো উচিত)
- **Status Filtering Logic**: ইউজার এবং এডমিনের জন্য আলাদা স্ট্যাটাস ফিল্টারিং নেই

#### ২.৬ রিসাবমিট ফিচার
- **Resubmit Order Option**: ৩-ডট মেনুতে রিসাবমিট অপশন নেই
- **Balance Detection**: প্রোভাইডার ব্যালেন্স চেক করার সিস্টেম নেই
- **Resubmit API**: রিসাবমিট করার জন্য আলাদা API নেই

## ৩. ইউজার রিকোয়ারমেন্ট বিশ্লেষণ

### ৩.১ ইউজার অর্ডার স্ট্যাটাস
**প্রয়োজনীয়তা**: ইউজার অর্ডার করলে সবসময় "পেন্ডিং" স্ট্যাটাস দেখাবে, "ফেইল্ড" দেখাবে না।

**বর্তমান সমস্যা**: ইউজাররা ফেইল্ড স্ট্যাটাস দেখতে পাচ্ছে।

**সমাধান**: ইউজার ইন্টারফেসে স্ট্যাটাস ফিল্টারিং লজিক যোগ করতে হবে।

### ৩.২ এডমিন অর্ডার স্ট্যাটাস
**প্রয়োজনীয়তা**: প্রোভাইডারের ব্যালেন্স না থাকলে এডমিন প্যানেলে "ফেইল্ড" স্ট্যাটাস দেখাবে।

**বর্তমান অবস্থা**: এডমিন প্যানেলে ফেইল্ড স্ট্যাটাস দেখানো হচ্ছে।

### ৩.৩ রিসাবমিট অর্ডার ফিচার
**প্রয়োজনীয়তা**: 
- ফেইল্ড অর্ডারের ৩-ডট মেনুতে "Resubmit Order" অপশন
- ব্যালেন্স লোড করার পর রিসাবমিট করলে সফলভাবে প্রোভাইডারে হিট করবে

**বর্তমান অবস্থা**: এই ফিচার এখনও ইমপ্লিমেন্ট করা হয়নি।

## ৪. সিস্টেম ওয়ার্কফ্লো

### ৪.১ বর্তমান ওয়ার্কফ্লো
```
১. ইউজার অর্ডার তৈরি করে
২. সিস্টেম সার্ভিসের প্রোভাইডার চেক করে
৩. প্রোভাইডারে অর্ডার ফরওয়ার্ড করে
৪. প্রোভাইডার রেসপন্স লগ করে
৫. ক্রন জব দিয়ে স্ট্যাটাস সিঙ্ক করে
৬. এডমিন প্যানেলে স্ট্যাটাস দেখায়
```

### ৪.২ প্রয়োজনীয় ওয়ার্কফ্লো
```
১. ইউজার অর্ডার তৈরি করে
২. সিস্টেম সার্ভিসের প্রোভাইডার চেক করে
৩. প্রোভাইডারে অর্ডার ফরওয়ার্ড করে
৪. প্রোভাইডার ব্যালেন্স চেক করে
৫. ব্যালেন্স না থাকলে ফেইল্ড মার্ক করে
৬. ইউজারকে "পেন্ডিং" দেখায়, এডমিনকে "ফেইল্ড" দেখায়
৭. এডমিন রিসাবমিট অপশন পায়
৮. রিসাবমিট করলে আবার প্রোভাইডারে পাঠায়
```

## ৫. ডেটাবেস স্কিমা রিকোয়ারমেন্ট

### ৫.১ বর্তমান স্কিমা
```sql
-- NewOrder Table (বর্তমান)
CREATE TABLE neworder (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    service_id INTEGER,
    link TEXT,
    quantity INTEGER,
    charge DECIMAL,
    start_count INTEGER,
    status VARCHAR(50),
    remains INTEGER,
    provider_order_id VARCHAR(255),
    provider_id INTEGER,
    provider_status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- ProviderOrderTracking Table
CREATE TABLE provider_order_tracking (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES neworder(id),
    provider_id INTEGER,
    provider_order_id VARCHAR(255),
    provider_status VARCHAR(50),
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP
);

-- ProviderApiLog Table
CREATE TABLE provider_api_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    provider_id INTEGER,
    action VARCHAR(50),
    request_data TEXT,
    response_data TEXT,
    status_code INTEGER,
    created_at TIMESTAMP
);
```

### ৫.২ প্রয়োজনীয় স্কিমা আপডেট
```sql
-- NewOrder Table এ নতুন ফিল্ড যোগ করতে হবে
ALTER TABLE neworder ADD COLUMN resubmit_count INTEGER DEFAULT 0;
ALTER TABLE neworder ADD COLUMN last_resubmit_at TIMESTAMP;
ALTER TABLE neworder ADD COLUMN balance_check_status VARCHAR(50);
ALTER TABLE neworder ADD COLUMN user_visible_status VARCHAR(50);
ALTER TABLE neworder ADD COLUMN admin_visible_status VARCHAR(50);
```

## ৬. API এন্ডপয়েন্ট রিকোয়ারমেন্ট

### ৬.১ বর্তমান API এন্ডপয়েন্টস
```
POST /api/orders/create-orders - ইউজার অর্ডার তৈরি
POST /api/orders/place-to-provider - প্রোভাইডারে অর্ডার পাঠানো
GET /api/cron/sync-provider-orders - অটো সিঙ্ক
POST /api/admin/provider-sync - ম্যানুয়াল সিঙ্ক
```

### ৬.২ প্রয়োজনীয় নতুন API এন্ডপয়েন্টস
```
POST /api/admin/orders/resubmit - অর্ডার রিসাবমিট
GET /api/orders/user-status/{orderId} - ইউজার স্ট্যাটাস
GET /api/admin/orders/admin-status/{orderId} - এডমিন স্ট্যাটাস
POST /api/providers/check-balance - প্রোভাইডার ব্যালেন্স চেক
```

### ৬.৩ API ইমপ্লিমেন্টেশন প্ল্যান

#### ৬.৩.১ Resubmit Order API
```typescript
// /api/admin/orders/resubmit/route.ts
export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    
    // অর্ডার খুঁজে বের করা
    const order = await prisma.newOrder.findUnique({
      where: { id: orderId },
      include: { service: { include: { provider: true } } }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'অর্ডার পাওয়া যায়নি' }, { status: 404 });
    }
    
    // প্রোভাইডার ব্যালেন্স চেক
    const balanceCheck = await checkProviderBalance(order.service.provider);
    
    if (!balanceCheck.hasBalance) {
      return NextResponse.json({ 
        error: 'প্রোভাইডারের ব্যালেন্স অপর্যাপ্ত',
        balance: balanceCheck.balance 
      }, { status: 400 });
    }
    
    // অর্ডার রিসাবমিট
    const resubmitResult = await resubmitOrderToProvider(order);
    
    // ডেটাবেস আপডেট
    await prisma.newOrder.update({
      where: { id: orderId },
      data: {
        resubmit_count: { increment: 1 },
        last_resubmit_at: new Date(),
        status: 'pending',
        admin_visible_status: 'resubmitted',
        user_visible_status: 'pending'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'অর্ডার সফলভাবে রিসাবমিট হয়েছে',
      providerOrderId: resubmitResult.orderId
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'রিসাবমিট করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
```

#### ৬.৩.২ User Status API
```typescript
// /api/orders/user-status/[orderId]/route.ts
export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const order = await prisma.newOrder.findUnique({
      where: { id: parseInt(params.orderId) }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'অর্ডার পাওয়া যায়নি' }, { status: 404 });
    }
    
    // ইউজারের জন্য স্ট্যাটাস ফিল্টার
    let userStatus = order.status;
    if (order.status === 'failed' || order.status === 'cancelled') {
      userStatus = 'pending'; // ইউজারকে সবসময় পেন্ডিং দেখাবে
    }
    
    return NextResponse.json({
      orderId: order.id,
      status: userStatus,
      quantity: order.quantity,
      charge: order.charge,
      created_at: order.created_at
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'স্ট্যাটাস লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
```

## ৭. UI পরিবর্তন রিকোয়ারমেন্ট

### ৭.১ এডমিন প্যানেল পরিবর্তন

#### ৭.১.১ অর্ডার টেবিলে রিসাবমিট অপশন
```tsx
// app/(protected)/admin/orders/page.tsx এ যোগ করতে হবে

const OrderActionsMenu = ({ order }: { order: Order }) => {
  const [isResubmitting, setIsResubmitting] = useState(false);
  
  const handleResubmit = async () => {
    setIsResubmitting(true);
    try {
      const response = await fetch('/api/admin/orders/resubmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('অর্ডার সফলভাবে রিসাবমিট হয়েছে');
        // টেবিল রিফ্রেশ করা
        window.location.reload();
      } else {
        toast.error(result.error || 'রিসাবমিট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsResubmitting(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {/* View Details */}}>
          বিস্তারিত দেখুন
        </DropdownMenuItem>
        
        {order.status === 'failed' && (
          <DropdownMenuItem 
            onClick={handleResubmit}
            disabled={isResubmitting}
            className="text-blue-600"
          >
            {isResubmitting ? 'রিসাবমিট হচ্ছে...' : 'Resubmit Order'}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => {/* Cancel Order */}}>
          অর্ডার বাতিল করুন
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

#### ৭.১.২ স্ট্যাটাস ইন্ডিকেটর
```tsx
const StatusBadge = ({ status, isAdmin }: { status: string, isAdmin: boolean }) => {
  const getStatusDisplay = () => {
    if (!isAdmin && (status === 'failed' || status === 'cancelled')) {
      return { text: 'পেন্ডিং', color: 'bg-yellow-100 text-yellow-800' };
    }
    
    switch (status) {
      case 'pending':
        return { text: 'পেন্ডিং', color: 'bg-yellow-100 text-yellow-800' };
      case 'processing':
        return { text: 'প্রসেসিং', color: 'bg-blue-100 text-blue-800' };
      case 'completed':
        return { text: 'সম্পন্ন', color: 'bg-green-100 text-green-800' };
      case 'failed':
        return { text: 'ব্যর্থ', color: 'bg-red-100 text-red-800' };
      case 'cancelled':
        return { text: 'বাতিল', color: 'bg-gray-100 text-gray-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  const { text, color } = getStatusDisplay();
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
};
```

### ৭.২ ইউজার ড্যাশবোর্ড পরিবর্তন

#### ৭.২.১ অর্ডার স্ট্যাটাস ফিল্টারিং
```tsx
// ইউজার অর্ডার লিস্টে স্ট্যাটাস ফিল্টার করতে হবে
const UserOrderList = () => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      const response = await fetch('/api/user/orders');
      const data = await response.json();
      
      // ইউজারের জন্য স্ট্যাটাস ফিল্টার
      const filteredOrders = data.map(order => ({
        ...order,
        status: (order.status === 'failed' || order.status === 'cancelled') 
          ? 'pending' 
          : order.status
      }));
      
      setOrders(filteredOrders);
    };
    
    fetchOrders();
  }, []);
  
  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">অর্ডার #{order.id}</h3>
              <p className="text-sm text-gray-600">{order.service_name}</p>
            </div>
            <StatusBadge status={order.status} isAdmin={false} />
          </div>
        </div>
      ))}
    </div>
  );
};
```

## ৮. প্রোভাইডার ব্যালেন্স চেক সিস্টেম

### ৮.১ ব্যালেন্স চেক ফাংশন
```typescript
// lib/services/providerBalanceChecker.ts
export class ProviderBalanceChecker {
  static async checkBalance(provider: Provider): Promise<BalanceCheckResult> {
    try {
      const response = await fetch(`${provider.api_url}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: provider.api_key,
          action: 'balance'
        })
      });
      
      const data = await response.json();
      
      return {
        hasBalance: parseFloat(data.balance) > 0,
        balance: parseFloat(data.balance),
        currency: data.currency || 'USD',
        lastChecked: new Date()
      };
      
    } catch (error) {
      console.error('ব্যালেন্স চেক করতে সমস্যা:', error);
      return {
        hasBalance: false,
        balance: 0,
        currency: 'USD',
        lastChecked: new Date(),
        error: 'ব্যালেন্স চেক করতে পারিনি'
      };
    }
  }
  
  static async checkAllProviders(): Promise<Map<number, BalanceCheckResult>> {
    const providers = await prisma.provider.findMany();
    const results = new Map<number, BalanceCheckResult>();
    
    for (const provider of providers) {
      const result = await this.checkBalance(provider);
      results.set(provider.id, result);
    }
    
    return results;
  }
}

interface BalanceCheckResult {
  hasBalance: boolean;
  balance: number;
  currency: string;
  lastChecked: Date;
  error?: string;
}
```

### ৮.২ অর্ডার ফরওয়ার্ডিং এ ব্যালেন্স চেক ইন্টিগ্রেশন
```typescript
// lib/services/providerOrderForwarder.ts এ আপডেট
export class ProviderOrderForwarder {
  static async forwardOrder(order: NewOrder): Promise<ForwardResult> {
    try {
      // প্রথমে ব্যালেন্স চেক করা
      const balanceCheck = await ProviderBalanceChecker.checkBalance(order.service.provider);
      
      if (!balanceCheck.hasBalance) {
        // ব্যালেন্স না থাকলে ফেইল্ড মার্ক করা
        await prisma.newOrder.update({
          where: { id: order.id },
          data: {
            status: 'failed',
            admin_visible_status: 'failed_insufficient_balance',
            user_visible_status: 'pending',
            balance_check_status: 'insufficient'
          }
        });
        
        return {
          success: false,
          error: 'প্রোভাইডারের ব্যালেন্স অপর্যাপ্ত',
          balance: balanceCheck.balance
        };
      }
      
      // ব্যালেন্স থাকলে অর্ডার পাঠানো
      const response = await this.sendOrderToProvider(order);
      
      return response;
      
    } catch (error) {
      console.error('অর্ডার ফরওয়ার্ড করতে সমস্যা:', error);
      return {
        success: false,
        error: 'অর্ডার পাঠাতে সমস্যা হয়েছে'
      };
    }
  }
}
```

## ৯. টেস্টিং প্ল্যান

### ৯.১ ইউনিট টেস্ট
```typescript
// tests/providerOrderSystem.test.ts
describe('Provider Order System', () => {
  test('ইউজার স্ট্যাটাস ফিল্টারিং', async () => {
    const order = await createTestOrder({ status: 'failed' });
    const userStatus = await getUserOrderStatus(order.id);
    expect(userStatus.status).toBe('pending');
  });
  
  test('এডমিন স্ট্যাটাস প্রদর্শন', async () => {
    const order = await createTestOrder({ status: 'failed' });
    const adminStatus = await getAdminOrderStatus(order.id);
    expect(adminStatus.status).toBe('failed');
  });
  
  test('রিসাবমিট অর্ডার', async () => {
    const order = await createTestOrder({ status: 'failed' });
    const result = await resubmitOrder(order.id);
    expect(result.success).toBe(true);
  });
  
  test('ব্যালেন্স চেক', async () => {
    const provider = await createTestProvider();
    const balanceResult = await ProviderBalanceChecker.checkBalance(provider);
    expect(balanceResult).toHaveProperty('hasBalance');
    expect(balanceResult).toHaveProperty('balance');
  });
});
```

### ৯.২ ইন্টিগ্রেশন টেস্ট
```typescript
describe('Order Workflow Integration', () => {
  test('সম্পূর্ণ অর্ডার ওয়ার্কফ্লো', async () => {
    // ১. অর্ডার তৈরি
    const order = await createOrder({
      user_id: 1,
      service_id: 1,
      quantity: 100
    });
    
    // ২. প্রোভাইডারে ফরওয়ার্ড
    const forwardResult = await forwardOrderToProvider(order);
    expect(forwardResult.success).toBe(true);
    
    // ৩. স্ট্যাটাস সিঙ্ক
    await syncProviderOrderStatus(order.id);
    
    // ৪. ইউজার স্ট্যাটাস চেক
    const userStatus = await getUserOrderStatus(order.id);
    expect(userStatus.status).not.toBe('failed');
  });
});
```

## ১০. সিকিউরিটি বিবেচনা

### ১০.১ API সিকিউরিটি
- **Authentication**: সব API এন্ডপয়েন্টে প্রপার অথেন্টিকেশন চেক
- **Authorization**: এডমিন API শুধু এডমিনরা ব্যবহার করতে পারবে
- **Rate Limiting**: রিসাবমিট API তে রেট লিমিটিং
- **Input Validation**: সব ইনপুট ভ্যালিডেশন

### ১০.২ ডেটা সিকিউরিটি
- **API Key Protection**: প্রোভাইডার API কী এনক্রিপ্ট করে রাখা
- **Sensitive Data Logging**: সেনসিটিভ ডেটা লগ না করা
- **Database Security**: ডেটাবেস কানেকশন সিকিউর রাখা

## ১১. পারফরমেন্স অপটিমাইজেশন

### ১১.১ ডেটাবেস অপটিমাইজেশন
```sql
-- প্রয়োজনীয় ইনডেক্স
CREATE INDEX idx_neworder_status ON neworder(status);
CREATE INDEX idx_neworder_provider_id ON neworder(provider_id);
CREATE INDEX idx_neworder_user_id_status ON neworder(user_id, status);
CREATE INDEX idx_provider_order_tracking_order_id ON provider_order_tracking(order_id);
CREATE INDEX idx_provider_api_log_order_id ON provider_api_log(order_id);
```

### ১১.২ API অপটিমাইজেশন
- **Caching**: ফ্রিকোয়েন্ট API রেসপন্স ক্যাশ করা
- **Pagination**: বড় ডেটাসেটের জন্য পেজিনেশন
- **Background Jobs**: ভারী কাজ ব্যাকগ্রাউন্ডে করা

## ১২. মনিটরিং এবং লগিং

### ১২.১ লগিং সিস্টেম
```typescript
// lib/logger.ts
export class OrderLogger {
  static logOrderCreation(order: NewOrder) {
    console.log(`[ORDER_CREATED] Order ${order.id} created for user ${order.user_id}`);
  }
  
  static logOrderForward(order: NewOrder, provider: Provider) {
    console.log(`[ORDER_FORWARD] Order ${order.id} forwarded to provider ${provider.name}`);
  }
  
  static logOrderResubmit(order: NewOrder) {
    console.log(`[ORDER_RESUBMIT] Order ${order.id} resubmitted`);
  }
  
  static logBalanceCheck(provider: Provider, balance: number) {
    console.log(`[BALANCE_CHECK] Provider ${provider.name} balance: ${balance}`);
  }
}
```

### ১২.২ মনিটরিং মেট্রিক্স
- **Order Success Rate**: অর্ডার সাকসেস রেট
- **Provider Response Time**: প্রোভাইডার রেসপন্স টাইম
- **Balance Check Frequency**: ব্যালেন্স চেক ফ্রিকোয়েন্সি
- **Resubmit Rate**: রিসাবমিট রেট

## ১৩. ডিপ্লয়মেন্ট প্ল্যান

### ১৩.১ ডেটাবেস মাইগ্রেশন
```sql
-- migration_add_resubmit_features.sql
BEGIN;

-- নতুন কলাম যোগ করা
ALTER TABLE neworder ADD COLUMN IF NOT EXISTS resubmit_count INTEGER DEFAULT 0;
ALTER TABLE neworder ADD COLUMN IF NOT EXISTS last_resubmit_at TIMESTAMP;
ALTER TABLE neworder ADD COLUMN IF NOT EXISTS balance_check_status VARCHAR(50);
ALTER TABLE neworder ADD COLUMN IF NOT EXISTS user_visible_status VARCHAR(50);
ALTER TABLE neworder ADD COLUMN IF NOT EXISTS admin_visible_status VARCHAR(50);

-- ইনডেক্স যোগ করা
CREATE INDEX IF NOT EXISTS idx_neworder_resubmit_count ON neworder(resubmit_count);
CREATE INDEX IF NOT EXISTS idx_neworder_balance_check_status ON neworder(balance_check_status);

-- বর্তমান ডেটা আপডেট করা
UPDATE neworder SET 
  user_visible_status = CASE 
    WHEN status IN ('failed', 'cancelled') THEN 'pending'
    ELSE status
  END,
  admin_visible_status = status
WHERE user_visible_status IS NULL;

COMMIT;
```

### ১৩.২ ডিপ্লয়মেন্ট স্টেপস
1. **ডেটাবেস ব্যাকআপ**: প্রোডাকশন ডেটাবেসের ব্যাকআপ নেওয়া
2. **মাইগ্রেশন রান**: নতুন স্কিমা মাইগ্রেশন চালানো
3. **API ডিপ্লয়**: নতুন API এন্ডপয়েন্ট ডিপ্লয় করা
4. **ফ্রন্টএন্ড ডিপ্লয়**: UI পরিবর্তন ডিপ্লয় করা
5. **টেস্টিং**: প্রোডাকশনে টেস্ট করা
6. **মনিটরিং**: সিস্টেম মনিটর করা

## ১৪. ভবিষ্যৎ উন্নতি

### ১৪.১ সম্ভাব্য ফিচার
- **Auto Balance Reload**: অটোমেটিক ব্যালেন্স রিলোড
- **Provider Failover**: একটি প্রোভাইডার ফেইল হলে অন্যটিতে পাঠানো
- **Smart Retry Logic**: স্মার্ট রিট্রাই লজিক
- **Real-time Notifications**: রিয়েল-টাইম নোটিফিকেশন

### ১৪.২ স্কেলিং প্ল্যান
- **Database Sharding**: ডেটাবেস শার্ডিং
- **Microservices**: মাইক্রোসার্ভিস আর্কিটেকচার
- **Load Balancing**: লোড ব্যালেন্সিং
- **Caching Layer**: ক্যাশিং লেয়ার

## ১৫. সমস্যা সমাধান গাইড

### ১৫.১ সাধারণ সমস্যা

#### সমস্যা: রিসাবমিট কাজ করছে না
**সমাধান**:
1. প্রোভাইডার API কী চেক করুন
2. প্রোভাইডার ব্যালেন্স চেক করুন
3. নেটওয়ার্ক কানেকটিভিটি চেক করুন
4. API লগ চেক করুন

#### সমস্যা: ইউজার ফেইল্ড স্ট্যাটাস দেখতে পাচ্ছে
**সমাধান**:
1. ফ্রন্টএন্ড স্ট্যাটাস ফিল্টার চেক করুন
2. API রেসপন্স চেক করুন
3. ডেটাবেস user_visible_status ফিল্ড চেক করুন

#### সমস্যা: প্রোভাইডার সিঙ্ক কাজ করছে না
**সমাধান**:
1. ক্রন জব চেক করুন
2. প্রোভাইডার API স্ট্যাটাস চেক করুন
3. নেটওয়ার্ক টাইমআউট চেক করুন

## ১৬. সংক্ষিপ্ত সারাংশ

### ✅ সম্পন্ন কাজ
- প্রোভাইডার অর্ডার ফরওয়ার্ডিং সিস্টেম
- অর্ডার স্ট্যাটাস সিঙ্ক সিস্টেম
- এডমিন প্যানেলে প্রোভাইডার স্ট্যাটাস
- ডেটাবেস স্কিমা আপডেট
- API এন্ডপয়েন্ট তৈরি

### ❌ বাকি কাজ
- ইউজার স্ট্যাটাস ফিল্টারিং (পেন্ডিং দেখানো)
- রিসাবমিট অর্ডার ফিচার
- প্রোভাইডার ব্যালেন্স চেক সিস্টেম
- ৩-ডট মেনুতে রিসাবমিট অপশন
- UI আপডেট

### 🎯 পরবর্তী পদক্ষেপ
1. ইউজার স্ট্যাটাস ফিল্টারিং ইমপ্লিমেন্ট করা
2. রিসাবমিট API তৈরি করা
3. এডমিন প্যানেলে রিসাবমিট অপশন যোগ করা
4. ব্যালেন্স চেক সিস্টেম ইমপ্লিমেন্ট করা
5. টেস্টিং এবং ডিপ্লয়মেন্ট

---

**নোট**: এই ডকুমেন্টটি সিস্টেমের বর্তমান অবস্থা এবং প্রয়োজনীয় কাজের একটি সম্পূর্ণ গাইড। সব কাজ সম্পন্ন হলে একটি সম্পূর্ণ প্রোভাইডার অর্ডার ট্র্যাকিং সিস্টেম পাওয়া যাবে যা ইউজার এবং এডমিনদের জন্য আলাদা অভিজ্ঞতা প্রদান করবে।