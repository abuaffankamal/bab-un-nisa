import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Client, InsertClient } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useClients() {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch all clients
  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  // Create a new client
  const createMutation = useMutation({
    mutationFn: async (client: Omit<InsertClient, "userId">) => {
      setIsUpdating(true);
      const response = await apiRequest("POST", "/api/clients", client);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error creating client:", error);
      setIsUpdating(false);
    }
  });
  
  // Update an existing client
  const updateMutation = useMutation({
    mutationFn: async ({ id, client }: { id: number; client: Partial<InsertClient> }) => {
      setIsUpdating(true);
      const response = await apiRequest("PATCH", `/api/clients/${id}`, client);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      setIsUpdating(false);
    }
  });
  
  // Delete a client
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsUpdating(true);
      await apiRequest("DELETE", `/api/clients/${id}`, undefined);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] }); // Also invalidate meetings as they may reference clients
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      setIsUpdating(false);
    }
  });
  
  const createClient = async (client: Omit<InsertClient, "userId">) => {
    return createMutation.mutateAsync(client);
  };
  
  const updateClient = async (id: number, client: Partial<InsertClient>) => {
    return updateMutation.mutateAsync({ id, client });
  };
  
  const deleteClient = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };
  
  return {
    clients,
    isLoading: isLoading || isUpdating,
    error,
    createClient,
    updateClient,
    deleteClient
  };
}
