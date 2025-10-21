"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Search, MoreVertical, Phone, Video } from "lucide-react"
import { Header } from "@/components/header"

const mockConversations = [
  {
    id: 1,
    landlordName: "Ram Sharma",
    landlordAvatar: "RS",
    propertyTitle: "Cozy Room in Thamel",
    lastMessage: "The room is available for immediate move-in. Would you like to schedule a visit?",
    timestamp: "2 hours ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    landlordName: "Sita Poudel",
    landlordAvatar: "SP",
    propertyTitle: "Spacious Flat in Baneshwor",
    lastMessage: "Thank you for your interest. The monthly rent is NPR 25,000.",
    timestamp: "1 day ago",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    landlordName: "Krishna Thapa",
    landlordAvatar: "KT",
    propertyTitle: "Student Room Near KU",
    lastMessage: "Hi, is this property still available?",
    timestamp: "3 days ago",
    unread: 1,
    online: true,
  },
]

const mockMessages = [
  {
    id: 1,
    sender: "tenant",
    message: "Hi, I saw your listing for the room in Thamel. Is it still available?",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    sender: "landlord",
    message: "Hello! Yes, the room is still available. Would you like to know more details?",
    timestamp: "10:45 AM",
  },
  {
    id: 3,
    sender: "tenant",
    message: "Yes, please. What amenities are included and when can I visit?",
    timestamp: "10:47 AM",
  },
  {
    id: 4,
    sender: "landlord",
    message: "The room includes Wi-Fi, 24/7 water supply, and security. You can visit anytime between 10 AM to 6 PM.",
    timestamp: "10:50 AM",
  },
  {
    id: 5,
    sender: "landlord",
    message: "The room is available for immediate move-in. Would you like to schedule a visit?",
    timestamp: "2 hours ago",
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showConversationList, setShowConversationList] = useState(true)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    console.log("Sending message:", newMessage)
    setNewMessage("")
  }

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.landlordName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectConversation = (conversation: (typeof mockConversations)[0]) => {
    setSelectedConversation(conversation)
    setShowConversationList(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} userInfo={{
        name: "User",
        email: "user@example.com",
        avatar: "/placeholder.svg",
        initials: "U"
      }} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className={`rounded-xl overflow-hidden ${showConversationList ? "block" : "hidden lg:block"}`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Messages</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                    className={`p-4 cursor-pointer transition-colors border-l-4 ${
                      selectedConversation.id === conversation.id
                        ? "bg-orange-50 dark:bg-orange-950/20 border-l-orange-500"
                        : "hover:bg-muted border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {conversation.landlordAvatar}
                        </div>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground truncate">{conversation.landlordName}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                            {conversation.unread > 0 && (
                              <Badge className="bg-orange-500 text-white text-xs min-w-[18px] h-5 flex items-center justify-center">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.propertyTitle}</p>
                        <p className="text-sm text-muted-foreground truncate mt-1">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className={`lg:col-span-2 ${showConversationList ? "hidden lg:block" : "block"}`}>
            <Card className="rounded-xl h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConversationList(true)}
                      className="lg:hidden"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <div className="relative">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedConversation.landlordAvatar}
                      </div>
                      {selectedConversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">{selectedConversation.landlordName}</h3>
                      <p className="text-sm text-muted-foreground truncate">{selectedConversation.propertyTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "tenant" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          message.sender === "tenant" 
                            ? "bg-orange-500 text-white" 
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "tenant" ? "text-orange-100" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
