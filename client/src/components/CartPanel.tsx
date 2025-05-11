import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2, X, Minus, Plus, ShoppingBag, Receipt, Truck, Clock, CreditCard, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartPanel({ isOpen, onClose }: CartPanelProps) {
  const [, navigate] = useLocation();
  const { 
    cart, 
    updateCartItemQuantity, 
    removeFromCart, 
    calculateTotals, 
    clearCart,
    promoCode,
    promoDiscount,
    clearPromoCode
  } = useCart();
  const { toast } = useToast();

  const { subtotal, serviceFee, tax, discount, total } = calculateTotals();

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add some items before checkout.",
        variant: "destructive",
      });
      return;
    }
    
    onClose();
    navigate("/checkout");
  };

  const cartItemVariants = {
    hidden: { 
      opacity: 0, 
      x: 20
    },
    visible: (index: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: index * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { 
        duration: 0.2
      }
    }
  };

  const estimatedPickupTime = () => {
    const now = new Date();
    
    // Calculate total prep time based on items in cart
    let totalPrepTime = 0;
    
    cart.forEach(item => {
      // Find the menu item to get its prep time
      // Use default prep time (15 minutes) if not available
      totalPrepTime += item.prepTime ? item.prepTime * item.quantity : 15 * item.quantity;
    });
    
    // Limit total prep time to 60 minutes maximum
    totalPrepTime = Math.min(totalPrepTime, 60);
    
    // Add some buffer time (5 minutes) for order processing
    const totalTimeInMinutes = totalPrepTime + 5;
    
    // Calculate the pickup time
    const pickupTime = new Date(now.getTime() + totalTimeInMinutes * 60000);
    
    return pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div 
        className={`overlay absolute inset-0 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>
      
      <div className={`side-panel absolute top-0 right-0 h-full w-full md:w-[420px] bg-card border-l border-border shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Cart Header - Fixed at top */}
          <div className="border-b border-border p-4 md:p-5 flex justify-between items-center bg-gradient-to-r from-primary/20 to-background text-foreground z-20">
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-primary mr-2 md:mr-3" />
              <h2 className="font-heading text-xl md:text-2xl">YOUR CART</h2>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10" onClick={onClose}>
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
          
          {/* Cart Items - Scrollable area */}
          <div className="flex-1 overflow-y-auto p-3 md:p-5 pb-36 md:pb-40">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <h3 className="text-3xl font-heading text-primary mb-4 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">HUNGRY?</h3>
                <p className="text-muted-foreground mb-10 max-w-xs">Your cart is empty and waiting to be filled with our delicious menu items</p>
                <div className="w-full flex justify-center">
                  <Button 
                    className="bg-primary hover:bg-primary/90 font-menu px-8 py-6 text-lg mx-auto rounded-xl"
                    onClick={onClose}
                  >
                    <Utensils className="mr-2 h-5 w-5" /> EXPLORE MENU
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="font-heading text-lg text-foreground">{cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-primary text-xs"
                    onClick={() => {
                      clearCart();
                      toast({
                        title: "Cart cleared",
                        description: "All items have been removed from your cart."
                      });
                    }}
                  >
                    CLEAR ALL
                  </Button>
                </div>

                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      className="flex p-3 mb-3 border border-border rounded-xl bg-card/60 hover:bg-muted/20 transition-colors"
                      variants={cartItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      layout
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg border border-border flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3 md:ml-4 flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-heading text-foreground text-sm md:text-base truncate mr-2">{item.name}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-muted-foreground hover:text-red-500 h-7 w-7 md:h-8 md:w-8 rounded-full flex-shrink-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center bg-muted rounded-lg">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8 rounded-full text-foreground hover:text-primary p-0"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <span className="w-6 md:w-8 text-center text-xs md:text-sm font-medium">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8 rounded-full text-foreground hover:text-primary p-0"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>
                          <span className="font-bold text-primary text-sm md:text-base">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Pickup information */}
                <div className="mt-4 p-3 md:p-4 bg-secondary/10 rounded-xl border border-border">
                  <div className="flex items-center mb-2">
                    <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-primary mr-1 md:mr-2" />
                    <h4 className="font-heading text-xs md:text-sm">PICKUP INFORMATION</h4>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mb-1">
                    <span>Estimated Ready:</span>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 text-primary" />
                      <span>{estimatedPickupTime()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                    <span>Payment:</span>
                    <div className="flex items-center">
                      <Receipt className="h-3 w-3 md:h-4 md:w-4 mr-1 text-primary" />
                      <span>Pay at Restaurant</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Cart Summary & Buttons - Fixed at bottom */}
          <div className="border-t border-border p-4 bg-card absolute bottom-0 left-0 right-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium text-foreground">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-green-500 flex items-center">
                    Promo ({promoCode}) <span className="ml-1 text-[10px] bg-green-500/10 px-1 py-0.5 rounded">APPLIED</span>
                  </span>
                  <span className="font-medium text-green-500">-${discount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-2 bg-border" />
              <div className="flex justify-between font-bold text-base md:text-xl">
                <span className="font-heading text-foreground">TOTAL</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-heading md:text-lg py-5"
                onClick={handleProceedToCheckout}
                disabled={cart.length === 0}
              >
                <Receipt className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                CHECKOUT
              </Button>
              <Button 
                variant="outline"
                className="w-full border-primary/20 text-foreground hover:bg-primary/10 hover:text-primary font-menu text-sm md:text-base"
                onClick={onClose}
              >
                CONTINUE BROWSING
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
