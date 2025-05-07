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
import { CreateEventRequest, icApi } from "../../lib/ic-api";

export function EventCreationForm() {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "", capacity: "" }]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#00FEFE");
  const [secondaryColor, setSecondaryColor] = useState("#FF00FF");
  const [artStyle, setArtStyle] = useState("cyberpunk");
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");

  useEffect(() => {
    // Debug effect to log when the date changes
    if (date) {
      console.log("Date state updated:", date);
      console.log("Formatted date:", format(date, "yyyy-MM-dd"));
    }
  }, [date]);

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

  const generatePreview = () => {
    setIsGeneratingPreview(true);
    // Simulate API call to generate preview
    setTimeout(() => {
      setIsGeneratingPreview(false);
      setPreviewGenerated(true);
      toast({
        title: "Preview Generated",
        description: "AI has generated a preview of your event ticket.",
      });
    }, 2000);
  };

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

      // Format date as YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd");
      console.log("Formatted date:", formattedDate);

      // Create the request object
      const request: CreateEventRequest = {
        name: eventName,
        description: eventDescription,
        date: formattedDate,
        time: eventTime || "12:00",
        location: eventLocation,
        imageUrl: null, // No image for now
        artStyle: artStyle,
        ticketTypes: ticketTypes.map(tt => ({
          name: tt.name,
          price: BigInt(parseFloat(tt.price || "0") * 100000000), // Convert to e8s (ICP smallest unit)
          capacity: BigInt(parseInt(tt.capacity || "0")),
          description: null,
        })),
      };

      console.log("Creating event with data:", request);

      // Call the API to create the event
      const result = await icApi.createEvent(request);

      if ("ok" in result) {
        toast({
          title: "Event Created",
          description: "Your event has been created successfully with ID: " + result.ok.toString(),
        });
        router.push("/organizer");
      } else {
        let errorMessage = "Unknown error";
        if ("NotAuthorized" in result.err) {
          errorMessage = "You are not authorized to create events.";
        } else if ("InvalidInput" in result.err) {
          errorMessage = "Invalid input data. Please check your form.";
        } else if ("SystemError" in result.err) {
          errorMessage = "System error. Please try again later.";
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
                      console.log("Date selected:", selectedDate);
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
                  <Label htmlFor={`ticket-price-${index}`}>Price (ICP)</Label>
                  <Input
                    id={`ticket-price-${index}`}
                    type="number"
                    step="0.001"
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
                      className="variant-ghost size-sm"
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
              className="w-full border border-gray-300 rounded-md p-2 text-center"
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

