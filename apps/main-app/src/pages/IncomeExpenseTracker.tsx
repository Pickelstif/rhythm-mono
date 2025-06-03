import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { CalendarIcon, PlusCircle, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Database } from "@/integrations/supabase/types";

type TransactionRow = Database['public']['Tables']['transactions']['Row'];

type Transaction = {
  id: string;
  band_id: string;
  amount: number;
  description: string;
  transaction_date: Date;
  created_by: string;
  created_at: Date;
};

type BandInfo = {
  id: string;
  name: string;
};

const IncomeExpenseTracker = () => {
  const { bandId } = useParams<{ bandId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [band, setBand] = useState<BandInfo | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (bandId && user) {
      fetchBandDetails();
      fetchTransactions();
      checkBandRole();
    }
  }, [bandId, user]);

  const fetchBandDetails = async () => {
    if (!bandId) return;

    try {
      const { data, error } = await supabase
        .from("bands")
        .select("id, name")
        .eq("id", bandId)
        .single();

      if (error) throw error;
      setBand(data);
    } catch (error) {
      console.error("Error fetching band details:", error);
      toast.error("Failed to fetch band details");
    }
  };

  const checkBandRole = async () => {
    if (!bandId || !user) return;

    try {
      const { data, error } = await supabase
        .from("band_members")
        .select("role")
        .eq("band_id", bandId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setIsLeader(data.role === "leader");
    } catch (error) {
      console.error("Error checking band role:", error);
    }
  };

  const fetchTransactions = async () => {
    if (!bandId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("band_id", bandId)
        .order("transaction_date", { ascending: false });

      if (error) throw error;

      const formattedTransactions: Transaction[] = data.map(transaction => ({
        ...transaction,
        transaction_date: new Date(transaction.transaction_date),
        created_at: new Date(transaction.created_at)
      }));

      setTransactions(formattedTransactions);
      
      // Calculate total balance
      const balance = formattedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      setTotalBalance(balance);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !bandId) return;
    
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("transactions")
        .insert({
          band_id: bandId,
          amount: numAmount,
          description,
          created_by: user.id
        });
        
      if (error) throw error;
      
      toast.success("Transaction added successfully");
      setAmount("");
      setDescription("");
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;
    
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", deletingTransaction.id);
        
      if (error) throw error;
      
      toast.success("Transaction deleted successfully");
      setDeletingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <div className="mb-8 mt-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{band?.name} - Financial Tracker</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/band/${bandId}`)}
          >
            Back to Band
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Most recent transactions are shown first
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    No transactions recorded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-full ${transaction.amount >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {transaction.amount >= 0 ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(transaction.transaction_date, 'PPP')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(transaction.amount)}
                          </span>
                          {isLeader && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setDeletingTransaction(transaction)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalBalance)}
                </div>
              </CardContent>
            </Card>

            {isLeader && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Transaction</CardTitle>
                  <CardDescription>
                    Enter a positive amount for income, negative for expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="100.00 or -50.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Gig payment, Equipment purchase, etc."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <AlertDialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this transaction? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTransaction} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default IncomeExpenseTracker; 