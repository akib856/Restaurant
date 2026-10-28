import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Home from '../pages/Home.jsx';
import Menu from '../pages/Menu.jsx';
import FoodDetail from '../pages/FoodDetail.jsx';
import Cart from '../pages/Cart.jsx';
import Checkout from '../pages/Checkout.jsx';
import OrderSuccess from '../pages/OrderSuccess.jsx';
import Auth from '../pages/Auth.jsx';
import Account from '../pages/Account.jsx';
import Admin from '../admin/Admin.jsx';
import { About, Contact, Delivery, Privacy, Terms, Cookies, NotFound } from '../pages/Static.jsx';
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:slug" element={<FoodDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
