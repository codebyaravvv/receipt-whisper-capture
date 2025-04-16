
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, FileSpreadsheet, FileJson } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

// Sample history data
const historyData = [
  {
    id: "INV-001",
    date: "2025-04-16T14:30:00",
    model: "Google Vision API",
    status: "Success",
    docType: "Invoice"
  },
  {
    id: "INV-002",
    date: "2025-04-15T10:15:00",
    model: "Invoice Parser Pro",
    status: "Success",
    docType: "Invoice"
  },
  {
    id: "REC-001",
    date: "2025-04-14T16:45:00",
    model: "Receipt Analyzer",
    status: "Failed",
    docType: "Receipt"
  },
  {
    id: "INV-003",
    date: "2025-04-13T09:30:00",
    model: "Google Vision API",
    status: "Success",
    docType: "Invoice"
  },
  {
    id: "INV-004",
    date: "2025-04-12T11:20:00",
    model: "Invoice Parser Pro",
    status: "Success",
    docType: "Invoice"
  },
];

const History = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter history data based on selected filters
  const filteredHistory = historyData.filter(item => {
    // Filter by date if selected
    if (date) {
      const itemDate = new Date(item.date);
      if (
        itemDate.getDate() !== date.getDate() ||
        itemDate.getMonth() !== date.getMonth() ||
        itemDate.getFullYear() !== date.getFullYear()
      ) {
        return false;
      }
    }
    
    // Filter by model
    if (modelFilter !== "all" && item.model !== modelFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const resetFilters = () => {
    setDate(undefined);
    setModelFilter("all");
    setStatusFilter("all");
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Convert data to format suitable for export
    const exportData = filteredHistory.map(item => ({
      ID: item.id,
      Date: format(new Date(item.date), "PPP"),
      Time: format(new Date(item.date), "p"),
      Model: item.model,
      Status: item.status,
      "Document Type": item.docType
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extraction History");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extraction_history.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export complete",
      description: "History report exported to Excel",
    });
  };

  const exportToJSON = () => {
    // Convert data to format suitable for export
    const exportData = filteredHistory.map(item => ({
      id: item.id,
      date: format(new Date(item.date), "PPP"),
      time: format(new Date(item.date), "p"),
      model: item.model,
      status: item.status,
      documentType: item.docType
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extraction_history.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export complete",
      description: "History report exported to JSON",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Extraction History</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">OCR Model</label>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="Google Vision API">Google Vision API</SelectItem>
                  <SelectItem value="Invoice Parser Pro">Invoice Parser Pro</SelectItem>
                  <SelectItem value="Receipt Analyzer">Receipt Analyzer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">History Records</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </Button>
            <Button variant="outline" onClick={exportToJSON} className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Export to JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>OCR Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{format(new Date(item.date), "PPP")}</TableCell>
                    <TableCell>{format(new Date(item.date), "p")}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "Success" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>{item.docType}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No records found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
