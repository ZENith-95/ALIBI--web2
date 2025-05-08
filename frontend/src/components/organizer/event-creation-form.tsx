"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Trash, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { CreateEventRequest, supabaseApi } from "../../lib/supabaseApi"; // Updated import

export function EventCreationForm() {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "", capacity: "" }]);
  // const [isGeneratingPreview, setIsGeneratingPreview] = useState(false); // Preview generation might be out of scope for now
  // const [previewGenerated, setPreviewGenerated] = useState(false);
  // const [primaryColor, setPrimaryColor] = useState("#00FEFE"); // Styling might be handled differently
  // const [secondaryColor, setSecondaryColor] = useState("#FF00FF");
  const [artStyle, setArtStyle] = useState("cyberpunk");
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: "", capacity: "" }]);
  };

  const removeTicketType = (index: number) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes.splice(index, 1);
    setTicketTypes(newTicketTypes);
  };

  const updateTicketType = (index: number, field: string, value: string) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    setTicketTypes(newTicketTypes);
  };

  // Preview generation might be removed or re-implemented later with a different service
  // const generatePreview = () => { ... };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!date) {
        toast({
          title: "Error",
          description: "Please select a date for your event.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (ticketTypes.some(ticket => !ticket.name || !ticket.price || !ticket.capacity)) {
        toast({
          title: "Error",
          description: "Please fill out all ticket type fields.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const formattedDate = format(date, "yyyy-MM-dd");

      const request: CreateEventRequest = {
        name: eventName,
        description: eventDescription,
        date: formattedDate,
        time: eventTime || "12:00", // Default time if not set
        location: eventLocation,
        image_url: null, // Placeholder for image URL
        art_style: artStyle,
        ticketTypes: ticketTypes.map(tt => ({
          name: tt.name,
          price: parseFloat(tt.price || "0"), // Price as number
          capacity: parseInt(tt.capacity || "0", 10), // Capacity as number
          description: null, // Or provide a field for this
        })),
      };

      console.log("Creating event with data (Supabase):", request);

      const result = await supabaseApi.createEvent(request); // Use supabaseApi

      if ('data' in result) { // Check if 'data' property exists
        toast({
          title: "Event Created",
          description: "Your event has been created successfully with ID: " + result.data,
        });
        router.push("/organizer");
      } else if ('error' in result) { // Check if 'error' property exists
        let errorMessage = "Unknown error";
        // Adjust error mapping based on SupabaseApi Error type
        switch (result.error.type) {
          case 'NotAuthorized':
            errorMessage = "You are not authorized to create events.";
            break;
          case 'InvalidInput':
            errorMessage = "Invalid input data. Please check your form.";
            break;
          case 'SystemError':
            errorMessage = `System error: ${result.error.details || 'Please try again later.'}`;
            break;
          default:
            errorMessage = `An unexpected error occurred: ${result.error.details || ''}`;
        }
        
        toast({
          title: "Error Creating Event",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter event name" 
                  required 
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date ? format(date, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const selectedDate = e.target.valueAsDate;
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                  min={format(new Date(), "yyyy-MM-dd")}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time</Label>
                <Input 
                  id="time"
                  type="time"
                  placeholder="e.g. 19:00" 
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Event Location</Label>
              <Input 
                id="location" 
                placeholder="Enter event location" 
                required 
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artStyle">Art Style</Label>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select art style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                  <SelectItem value="futuristic">Futuristic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe your event..." 
                className="min-h-32" 
                required 
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Ticket Types</h3>
          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-4 border-b border-border">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`ticket-name-${index}`}>Ticket Name</Label>
                  <Input
                    id={`ticket-name-${index}`}
                    placeholder="e.g. General Admission"
                    value={ticket.name}
                    onChange={(e) => updateTicketType(index, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`ticket-price-${index}`}>Price</Label> 
                  <Input
                    id={`ticket-price-${index}`}
                    type="number"
                    step="0.01" // For currency
                    placeholder="0.00"
                    value={ticket.price}
                    onChange={(e) => updateTicketType(index, "price", e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor={`ticket-capacity-${index}`}>Capacity</Label>
                    <Input
                      id={`ticket-capacity-${index}`}
                      type="number"
                      placeholder="100"
                      value={ticket.capacity}
                      onChange={(e) => updateTicketType(index, "capacity", e.target.value)}
                      required
                    />
                  </div>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      className="variant-ghost size-sm" // This might need to be a Button component with variant="ghost"
                      onClick={() => removeTicketType(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button 
              type="button" 
              onClick={addTicketType} 
              className="w-full border border-gray-300 rounded-md p-2 text-center flex items-center justify-center hover:bg-accent" // Added flex for icon alignment
            >
              <Plus className="mr-2 h-4 w-4 inline" />
              Add Ticket Type
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.push("/organizer")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Publish Event"
          )}
        </Button>
      </div>
    </form>
  );
}
