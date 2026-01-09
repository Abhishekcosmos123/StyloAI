import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {paymentService} from '../../services/api/paymentService';
import {getProfile} from '../../store/slices/profileSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const PaymentScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.auth);
  const {profile} = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPlans();
    checkPremiumStatus();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      Alert.alert('Error', 'Failed to load premium plans');
    } finally {
      setLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const response = await paymentService.checkPremiumStatus();
      if (response.success && response.data.isPremium) {
        // User already has premium
        Alert.alert(
          'Premium Active',
          `Your premium subscription is active until ${new Date(
            response.data.premiumExpiresAt
          ).toLocaleDateString()}`,
          [{text: 'OK', onPress: () => navigation.goBack()}]
        );
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handlePayment = async (plan) => {
    try {
      setProcessing(true);
      setSelectedPlan(plan);

      // Create payment order
      const orderResponse = await paymentService.createOrder(
        plan.price,
        plan.id
      );

      if (orderResponse.success) {
        const {paymentUrl, transactionId, merchantTransactionId} =
          orderResponse.data;

        // Open PhonePe payment URL
        const canOpen = await Linking.canOpenURL(paymentUrl);
        if (canOpen) {
          await Linking.openURL(paymentUrl);

          // Show alert to verify payment after returning
          Alert.alert(
            'Payment Initiated',
            'Complete the payment in PhonePe. Return to the app after payment.',
            [
              {
                text: 'I\'ve Completed Payment',
                onPress: () => verifyPayment(merchantTransactionId, transactionId),
              },
              {text: 'Cancel', style: 'cancel'},
            ]
          );
        } else {
          Alert.alert('Error', 'Cannot open PhonePe. Please install PhonePe app.');
        }
      } else {
        Alert.alert('Error', orderResponse.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const verifyPayment = async (merchantTransactionId, transactionId) => {
    try {
      setProcessing(true);
      const response = await paymentService.verifyPayment(
        merchantTransactionId,
        transactionId
      );

      if (response.success) {
        // Refresh profile to get updated premium status
        await dispatch(getProfile());

        Alert.alert(
          'Payment Successful!',
          'Your premium subscription has been activated. Enjoy all premium features!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Payment Pending',
          'Your payment is being processed. Please wait a few minutes and try again.',
          [
            {
              text: 'Verify Again',
              onPress: () => verifyPayment(merchantTransactionId, transactionId),
            },
            {text: 'Cancel', style: 'cancel'},
          ]
        );
      }
    } catch (error) {
      console.error('Verification Error:', error);
      Alert.alert(
        'Verification Failed',
        'Unable to verify payment. Please contact support if payment was successful.',
        [
          {
            text: 'Retry',
            onPress: () => verifyPayment(merchantTransactionId, transactionId),
          },
          {text: 'Cancel', style: 'cancel'},
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (profile?.isPremium) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.premiumCard}>
          <Icon name="checkmark-circle" size={64} color={colors.accent} />
          <Text style={styles.premiumTitle}>Premium Active</Text>
          <Text style={styles.premiumText}>
            You already have an active premium subscription
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Unlock all premium features and get the best styling experience
        </Text>
      </View>

      <View style={styles.featuresList}>
        <Text style={styles.featuresTitle}>Premium Features:</Text>
        {[
          'Daily outfit suggestions',
          'Weekly outfit planner',
          'Occasion-wise styling',
          'Wardrobe gap detection',
          'Style history & progress',
          'Priority support',
        ].map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Icon name="checkmark" size={20} color={colors.accent} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {plans.map((plan) => (
        <Card key={plan.id} style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDuration}>{plan.duration}</Text>
            </View>
            {plan.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{plan.discount}</Text>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{plan.price}</Text>
            {plan.originalPrice && (
              <Text style={styles.originalPrice}>₹{plan.originalPrice}</Text>
            )}
          </View>

          <View style={styles.planFeatures}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.planFeatureItem}>
                <Icon name="star" size={16} color={colors.primary} />
                <Text style={styles.planFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <Button
            title={
              processing && selectedPlan?.id === plan.id
                ? 'Processing...'
                : `Subscribe - ₹${plan.price}`
            }
            onPress={() => handlePayment(plan)}
            disabled={processing}
            style={styles.subscribeButton}
          />
        </Card>
      ))}

      <View style={styles.infoCard}>
        <Icon name="information-circle" size={20} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Payments are securely processed by PhonePe. Your payment information is
          never stored on our servers.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  featuresList: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
  },
  planCard: {
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  planDuration: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  discountBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 18,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  subscribeButton: {
    marginTop: 8,
  },
  premiumCard: {
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export default PaymentScreen;

