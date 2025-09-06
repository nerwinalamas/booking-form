"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormData, FormFieldName, formSchema } from "@/schema";
import { SERVICE_TYPES } from "@/lib/service-types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, Settings, CalendarIcon, FileText } from "lucide-react";
import Steps from "./steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const BookingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServiceType, setSelectedServiceType] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      emailAddress: "",
      propertyType: "",
      serviceAddress: "",
      serviceType: "",
      specificService: "",
      urgencyLevel: "",
      budgetRange: "",
      problemDescription: "",
      preferredTime: "",
      alternativeTime: "",
      accessInstructions: "",
      specialRequests: "",
      preferredContactMethod: "",
      bestTimeToCall: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      const formattedData = {
        ...values,
        preferredDate: values.preferredDate
          ? values.preferredDate.toISOString()
          : null,
        alternativeDate: values.alternativeDate
          ? values.alternativeDate.toISOString()
          : null,
      };

      console.log("Submitting data:", formattedData);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          "Booking request submitted successfully! We will contact you soon."
        );
        form.reset();
        setSelectedServiceType("");
        setCurrentStep(1);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        "Error: There was an error submitting your request. Please try again."
      );
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const serviceType = form.watch("serviceType");
  const preferredDate = form.watch("preferredDate");

  const handleServiceTypeChange = (value: string) => {
    setSelectedServiceType(value);
    form.setValue("serviceType", value);
    form.setValue("specificService", "");
  };

  const handleNext = async () => {
    let fieldsToValidate: FormFieldName[] = [];
    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "fullName",
          "phoneNumber",
          "emailAddress",
          "propertyType",
          "serviceAddress",
        ];
        break;
      case 2:
        fieldsToValidate = [
          "serviceType",
          "specificService",
          "urgencyLevel",
          "problemDescription",
        ];
        break;
      case 3:
        fieldsToValidate = ["preferredDate", "preferredTime"];
        break;
      case 4:
        fieldsToValidate = ["preferredContactMethod", "bestTimeToCall"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === 4) {
      form.handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isAlternativeDateDisabled = (date: Date) => {
    if (date < new Date() || date < new Date("1900-01-01")) {
      return true;
    }

    if (preferredDate) {
      const preferredDateOnly = new Date(
        preferredDate.getFullYear(),
        preferredDate.getMonth(),
        preferredDate.getDate()
      );
      const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      return dateOnly <= preferredDateOnly;
    }

    return false;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border bg-card rounded-xl shadow-sm my-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Book a Service</h1>
      <Steps currentStep={currentStep} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Client Information */}
          {currentStep === 1 && (
            <div className="pt-6 border-t">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Client Information</h3>
              </div>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan Dela Cruz"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger("fullName");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+63 912 345 6789"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger("phoneNumber");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="juan@example.com"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger("emailAddress");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Property Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("propertyType");
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="condominium">
                            Condominium
                          </SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="commercial-space">
                            Commercial Space
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Service Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Complete address including barangay, city, and landmarks"
                          className="min-h-[100px] resize-none"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger("serviceAddress");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 2: Service Details */}
          {currentStep === 2 && (
            <div className="pt-6 border-t">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Service Details</h3>
              </div>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Service Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          handleServiceTypeChange(value);
                          form.trigger("serviceType");
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="air-conditioning">
                            Air Conditioning
                          </SelectItem>
                          <SelectItem value="appliance-repair">
                            Appliance Repair
                          </SelectItem>
                          <SelectItem value="carpentry">Carpentry</SelectItem>
                          <SelectItem value="cleaning-services">
                            Cleaning Services
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specificService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Specific Service <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("specificService");
                        }}
                        defaultValue={field.value}
                        disabled={!selectedServiceType || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                serviceType
                                  ? "Select specific service"
                                  : "Select service type first"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedServiceType &&
                            SERVICE_TYPES[selectedServiceType]?.map(
                              (service) => (
                                <SelectItem
                                  key={service}
                                  value={service
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}
                                >
                                  {service}
                                </SelectItem>
                              )
                            )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgencyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Urgency Level <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("urgencyLevel");
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="emergency">
                            Emergency (Within 2 hours)
                          </SelectItem>
                          <SelectItem value="urgent">
                            Urgent (Same day)
                          </SelectItem>
                          <SelectItem value="normal">
                            Normal (1-3 days)
                          </SelectItem>
                          <SelectItem value="flexible">
                            Flexible (Within a week)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("budgetRange");
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under-1000">
                            Under ₱1,000
                          </SelectItem>
                          <SelectItem value="1000-3000">
                            ₱1,000 - ₱3,000
                          </SelectItem>
                          <SelectItem value="3000-5000">
                            ₱3,000 - ₱5,000
                          </SelectItem>
                          <SelectItem value="5000-10000">
                            ₱5,000 - ₱10,000
                          </SelectItem>
                          <SelectItem value="over-10000">
                            Over ₱10,000
                          </SelectItem>
                          <SelectItem value="get-quote">
                            Get a quote first
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="problemDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Problem Description{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe the problem in detail, including when it started, what you've already tried, and any relevant information..."
                          className="min-h-[120px] resize-none"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger("problemDescription");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 3: Preferred Schedule */}
          {currentStep === 3 && (
            <div className="pt-6 border-t">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Preferred Schedule</h3>
              </div>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="preferredDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Preferred Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                format(field.value, "MMMM dd, yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              form.trigger("preferredDate");
                              const alternativeDate =
                                form.getValues("alternativeDate");
                              if (
                                alternativeDate &&
                                date &&
                                alternativeDate <= date
                              ) {
                                form.setValue("alternativeDate", undefined);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Preferred Time <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("preferredTime");
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="8am-10am">
                            8:00 AM - 10:00 AM
                          </SelectItem>
                          <SelectItem value="10am-12pm">
                            10:00 AM - 12:00 PM
                          </SelectItem>
                          <SelectItem value="1pm-3pm">
                            1:00 PM - 3:00 PM
                          </SelectItem>
                          <SelectItem value="3pm-5pm">
                            3:00 PM - 5:00 PM
                          </SelectItem>
                          <SelectItem value="5pm-7pm">
                            5:00 PM - 7:00 PM
                          </SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alternativeDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Alternative Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting || !preferredDate}
                            >
                              {field.value ? (
                                format(field.value, "MMMM dd, yyyy")
                              ) : (
                                <span>
                                  {preferredDate
                                    ? "Pick an alternative date"
                                    : "Select preferred date first"}
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              form.trigger("alternativeDate");
                            }}
                            disabled={isAlternativeDateDisabled}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alternativeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Time</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("alternativeTime");
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select alternative time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="8am-10am">
                            8:00 AM - 10:00 AM
                          </SelectItem>
                          <SelectItem value="10am-12pm">
                            10:00 AM - 12:00 PM
                          </SelectItem>
                          <SelectItem value="1pm-3pm">
                            1:00 PM - 3:00 PM
                          </SelectItem>
                          <SelectItem value="3pm-5pm">
                            3:00 PM - 5:00 PM
                          </SelectItem>
                          <SelectItem value="5pm-7pm">
                            5:00 PM - 7:00 PM
                          </SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 4 && (
            <div className="pt-6 border-t">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">
                  Additional Information
                </h3>
              </div>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="accessInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How to access your property (gate codes, parking, building entrance, etc.)"
                          className="min-h-[80px] resize-none"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger("accessInstructions");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests or Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requirements, tools needed, or specific requests..."
                          className="min-h-[80px] resize-none"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger("specialRequests");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredContactMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Preferred Contact Method{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("preferredContactMethod");
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select contact method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="phone-call">Phone Call</SelectItem>
                          <SelectItem value="sms-text">SMS/Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bestTimeToCall"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Best Time to Call{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("bestTimeToCall");
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select best time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">
                            Morning (8AM - 12PM)
                          </SelectItem>
                          <SelectItem value="afternoon">
                            Afternoon (12PM - 5PM)
                          </SelectItem>
                          <SelectItem value="evening">
                            Evening (5PM - 8PM)
                          </SelectItem>
                          <SelectItem value="anytime">Anytime</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="ml-auto bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="ml-auto bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Book Service"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;
