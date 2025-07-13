import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, MapPin, Phone, Mail, CheckCircle, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Business, Service, Staff } from "@shared/schema";

const bookingSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  customerPhone: z.string().min(1, "Phone number is required"),
  serviceId: z.string().min(1, "Please select a service"),
  staffId: z.string().min(1, "Please select a staff member"),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, "Please select a time"),
});

type BookingForm = z.infer<typeof bookingSchema>;

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function BookingPage() {
  const [, params] = useRoute("/book/:businessId");
  const businessId = params?.businessId;
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookingComplete, setBookingComplete] = useState(false);

  const bookingForm = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      serviceId: "",
      staffId: "",
      time: "",
    },
  });

  const { data: bookingData, isLoading } = useQuery<{
    business: Business;
    services: Service[];
    staff: Staff[];
  }>({
    queryKey: [`/api/book/${businessId}`],
    enabled: !!businessId,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const customerData = {
        name: data.customerName,
        email: data.customerEmail || undefined,
        phone: data.customerPhone,
      };

      const selectedService = bookingData?.services.find(s => s.id === parseInt(data.serviceId));
      const [hours, minutes] = data.time.split(":").map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + (selectedService?.duration || 60);
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;

      const appointmentData = {
        serviceId: parseInt(data.serviceId),
        staffId: parseInt(data.staffId),
        date: format(data.date, "yyyy-MM-dd"),
        startTime: data.time,
        endTime,
        status: "confirmed" as const,
      };

      const response = await apiRequest("POST", `/api/book/${businessId}/appointment`, {
        customerData,
        appointmentData,
      });
      return await response.json();
    },
    onSuccess: () => {
      setBookingComplete(true);
      toast({
        title: "Booking confirmed!",
        description: "Your appointment has been successfully scheduled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingForm) => {
    createBookingMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!bookingData?.business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Business Not Found</CardTitle>
            <CardDescription>
              The booking link you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your appointment with {bookingData.business.name} has been successfully scheduled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Date:</strong> {selectedDate && format(selectedDate, "MMMM d, yyyy")}</p>
              <p><strong>Time:</strong> {bookingForm.getValues("time")}</p>
              <p><strong>Service:</strong> {bookingData.services.find(s => s.id === parseInt(bookingForm.getValues("serviceId")))?.name}</p>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                You will receive a confirmation email shortly. If you need to reschedule or cancel, 
                please contact {bookingData.business.name} directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { business, services, staff } = bookingData;
  const selectedService = services.find(s => s.id === parseInt(bookingForm.watch("serviceId") || "0"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Business Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{business.name}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-4">
                  <Badge variant="secondary">{business.industry}</Badge>
                  {business.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {business.address}
                    </span>
                  )}
                  {business.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {business.phone}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Book an Appointment</CardTitle>
            <CardDescription>
              Select a service, staff member, and preferred time for your appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={bookingForm.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    {...bookingForm.register("customerName")}
                    disabled={createBookingMutation.isPending}
                  />
                  {bookingForm.formState.errors.customerName && (
                    <p className="text-sm text-destructive">
                      {bookingForm.formState.errors.customerName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    {...bookingForm.register("customerPhone")}
                    disabled={createBookingMutation.isPending}
                  />
                  {bookingForm.formState.errors.customerPhone && (
                    <p className="text-sm text-destructive">
                      {bookingForm.formState.errors.customerPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email Address (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...bookingForm.register("customerEmail")}
                  disabled={createBookingMutation.isPending}
                />
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label>Select Service *</Label>
                <Select onValueChange={(value) => bookingForm.setValue("serviceId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        <div className="flex justify-between items-center w-full">
                          <span>{service.name}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {service.duration}min • ${service.price}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bookingForm.formState.errors.serviceId && (
                  <p className="text-sm text-destructive">
                    {bookingForm.formState.errors.serviceId.message}
                  </p>
                )}
              </div>

              {/* Staff Selection */}
              <div className="space-y-2">
                <Label>Select Staff Member *</Label>
                <Select onValueChange={(value) => bookingForm.setValue("staffId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{member.name}</span>
                          {member.specialization && (
                            <Badge variant="outline" className="text-xs">
                              {member.specialization}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bookingForm.formState.errors.staffId && (
                  <p className="text-sm text-destructive">
                    {bookingForm.formState.errors.staffId.message}
                  </p>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date *</Label>
                <Calendar
                  mode="single"
                  selected={bookingForm.watch("date")}
                  onSelect={(date) => {
                    if (date) {
                      bookingForm.setValue("date", date);
                      setSelectedDate(date);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
                {bookingForm.formState.errors.date && (
                  <p className="text-sm text-destructive">
                    {bookingForm.formState.errors.date.message}
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label>Select Time *</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={bookingForm.watch("time") === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => bookingForm.setValue("time", time)}
                      disabled={createBookingMutation.isPending}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                {bookingForm.formState.errors.time && (
                  <p className="text-sm text-destructive">
                    {bookingForm.formState.errors.time.message}
                  </p>
                )}
              </div>

              {/* Selected Service Summary */}
              {selectedService && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><strong>Service:</strong> {selectedService.name}</p>
                    <p><strong>Duration:</strong> {selectedService.duration} minutes</p>
                    <p><strong>Price:</strong> ${selectedService.price}</p>
                    {selectedDate && (
                      <p><strong>Date:</strong> {format(selectedDate, "MMMM d, yyyy")}</p>
                    )}
                    {bookingForm.watch("time") && (
                      <p><strong>Time:</strong> {bookingForm.watch("time")}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Booking
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}