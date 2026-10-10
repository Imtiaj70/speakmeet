import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateProfilePayload } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

export function useUser() {
  const queryClient = useQueryClient();
  const { isAuthenticated, refreshProfile } = useAuth();

  // Query: Current user profile from backend
  const userProfileQuery = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const profile = await userService.getMe();
      return profile;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Mutation: Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const updated = await userService.updateMe(payload);
      return updated;
    },
    onSuccess: async (updatedUser) => {
      // Invalidate and refetch
      queryClient.setQueryData(['currentUserProfile'], updatedUser);
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await refreshProfile();
    },
  });

  // Mutation or async checker: Username availability
  const checkUsername = async (username: string) => {
    return await userService.checkUsername(username);
  };

  return {
    profile: userProfileQuery.data,
    isLoading: userProfileQuery.isLoading,
    isError: userProfileQuery.isError,
    error: userProfileQuery.error,
    refetch: userProfileQuery.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
    checkUsername,
  };
}
