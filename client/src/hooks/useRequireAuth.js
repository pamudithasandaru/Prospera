import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps an action that only makes sense for a signed-in user.
 *
 * The browse pages are open to guests, but the buttons on them — add to cart,
 * post, like, apply — are not. Rather than hiding every one of those (which
 * hides the reason to sign up), each stays visible and routes a guest to the
 * login page, remembering where they were so they come straight back.
 *
 *   const requireAuth = useRequireAuth();
 *   <Button onClick={requireAuth(() => addToCart(id))}>Add to cart</Button>
 *
 * Returns a wrapper, so it can be dropped straight into onClick.
 */
const useRequireAuth = () => {
  const { isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (action) => (...args) => {
      if (isGuest) {
        return navigate('/login', { state: { from: location } });
      }
      return action(...args);
    },
    [isGuest, navigate, location]
  );
};

export default useRequireAuth;
