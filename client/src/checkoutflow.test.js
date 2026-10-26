import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import api from './services/api';
import CheckoutPage from './pages/marketplace/CheckoutPage';

// Factory form: the real module imports axios, which ships ESM that CRA's
// jest does not transform inside node_modules.
jest.mock('./services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
jest.mock('./context/CartContext', () => ({
  useCart: () => ({ items: [], subtotal: 0, refresh: jest.fn() }),
}));
jest.mock('@stripe/stripe-js', () => ({ loadStripe: () => Promise.resolve({}) }));
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div data-testid="elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => ({}),
  useElements: () => ({}),
}));

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { data: { publishableKey: 'pk_test_x', currency: 'lkr', testMode: true, enabled: true } } });
  api.post.mockResolvedValue({
    data: { data: { order: { _id: 'order_1', total: 17800, currency: 'LKR', items: [] }, clientSecret: 'pi_1_secret_abc' } },
  });
});

const renderIn = (Wrapper) =>
  render(
    <Wrapper>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      </ThemeProvider>
    </Wrapper>
  );

test('StrictMode: creates exactly one order and renders the card form', async () => {
  renderIn(React.StrictMode);

  await waitFor(() => expect(screen.getByTestId('payment-element')).toBeInTheDocument());

  const checkoutCalls = api.post.mock.calls.filter((c) => c[0] === '/marketplace/checkout');
  // eslint-disable-next-line no-console
  console.log('POST /marketplace/checkout calls:', checkoutCalls.length);
  expect(checkoutCalls).toHaveLength(1);
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});

test('without StrictMode it still creates exactly one order', async () => {
  renderIn(React.Fragment);
  await waitFor(() => expect(screen.getByTestId('payment-element')).toBeInTheDocument());
  expect(api.post.mock.calls.filter((c) => c[0] === '/marketplace/checkout')).toHaveLength(1);
});

test('a server refusal surfaces instead of spinning', async () => {
  api.post.mockRejectedValue({ response: { data: { message: 'Your cart is empty' } } });
  renderIn(React.StrictMode);
  await waitFor(() => expect(screen.getByText('Your cart is empty')).toBeInTheDocument());
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
