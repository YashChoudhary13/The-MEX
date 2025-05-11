import { useState } from 'react';
import { useRoute } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import OrderTracker from '@/components/OrderTracker';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ArrowLeft } from 'lucide-react';

// Form validation schema
const trackingSchema = z.object({
  orderId: z.string().min(1, "Order ID is required").refine(val => !isNaN(parseInt(val)), {
    message: "Order ID must be a number"
  })
});

export default function OrderTracking() {
  // Check if we have an order ID in the URL
  const [, params] = useRoute<{ orderId: string }>('/tracking/:orderId');
  const orderId = params?.orderId ? parseInt(params.orderId) : null;
  
  // State to track whether we're showing the form or the tracker
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(orderId);
  
  // Make sure we only pass non-null orderId to the OrderTracker component
  
  // Form setup
  const form = useForm<z.infer<typeof trackingSchema>>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      orderId: orderId?.toString() || ''
    }
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof trackingSchema>) {
    const numericOrderId = parseInt(values.orderId);
    setTrackingOrderId(numericOrderId);
  }
  
  // Handle going back to the form
  const handleBack = () => {
    setTrackingOrderId(null);
    form.reset({ orderId: '' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header onCartToggle={() => {}} hideSearch={true} />
      
      <div className="container mx-auto flex-1 py-10 px-4">
        {trackingOrderId ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Track a different order
              </Button>
            </div>
            
            <OrderTracker 
              orderId={trackingOrderId} 
              onRefresh={() => {
                // Optional callback if needed
              }}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">Track Your Order</CardTitle>
                <CardDescription>
                  Enter your order number to see real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your order number" 
                              {...field} 
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      Track Order
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium mb-2">Where's my order number?</h3>
                  <p className="text-sm text-muted-foreground">
                    You can find your order number in the confirmation email or text message you received after placing your order.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}