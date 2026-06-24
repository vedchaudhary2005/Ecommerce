import { useAuth } from '../hooks/useAuth';

// Simple test component to verify auth functionality
const TestAuth = () => {
  const { user, token, isAuthenticated, getUserInitials } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Authentication Test</h1>
          
          <div className="space-y-4">
            <div>
              <strong>Is Authenticated:</strong> {isAuthenticated() ? 'Yes' : 'No'}
            </div>
            
            {isAuthenticated() && (
              <>
                <div>
                  <strong>User Name:</strong> {user?.name}
                </div>
                <div>
                  <strong>Email:</strong> {user?.email}
                </div>
                <div>
                  <strong>Phone:</strong> {user?.phone}
                </div>
                <div>
                  <strong>Role:</strong> {user?.role}
                </div>
                <div>
                  <strong>User Initials:</strong> {getUserInitials()}
                </div>
                <div>
                  <strong>Token:</strong> {token ? 'Present' : 'Missing'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;