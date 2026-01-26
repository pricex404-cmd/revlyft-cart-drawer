import { getCurrencySymbol } from '../../../utils/currencyHelpers';

// Helper function to get reward icon
function getRewardIcon(rewardType) {
  const icons = {
    'shipping': '/assets/shipping-icon.svg',
    'free_gift': '/assets/gift-icon.svg',
    'discount': '/assets/discount-icon.svg',
    'custom': '/assets/star-icon.svg'
  };
  return icons[rewardType] || '/assets/star-icon.svg';
}

export default function ProgressBarPreview({ config, products, currencyCode, textColor }) {
  if (!config.enabled) return null;

  const currencySymbol = getCurrencySymbol(currencyCode);

  // Calculate current cart value for preview
  const currentValue = products && products.length > 0 
    ? (config.calculationType === 'cartTotal'
      ? products.reduce((sum, product) => sum + (parseFloat(product.price) || 0), 0)
      : products.length)
    : 0;
  
  const rewards = config.rewards || [];
  const sortedRewards = [...rewards].sort((a, b) => a.threshold - b.threshold);
  const maxThreshold = sortedRewards.length > 0 ? sortedRewards[sortedRewards.length - 1].threshold : 100;
  const progressPercentage = Math.min((currentValue / maxThreshold) * 100, 100);
  
  // Find next reward
  const nextReward = sortedRewards.find(r => r.threshold > currentValue);
  const allUnlocked = currentValue >= maxThreshold;
  
  return (
    <div style={{ padding: '12px 14px', borderBottom: '1px solid #e1e3e5', backgroundColor: 'transparent' }}>
      {/* Progress message */}
      {sortedRewards.length > 0 && (
        <div style={{ marginBottom: '16px', fontSize: '11px', color: textColor, fontWeight: '500', textAlign: 'center' }}>
          {allUnlocked ? (
            <span dangerouslySetInnerHTML={{ __html: config.completionText }} />
          ) : nextReward ? (
            <span>
              {nextReward.progressText ? (
                nextReward.progressText
                  .replace('{{goal}}', config.calculationType === 'cartTotal' ? `${currencySymbol}${nextReward.threshold}` : `${nextReward.threshold}`)
                  .replace('{{amount_left}}', config.calculationType === 'cartTotal' ? `${currencySymbol}${(nextReward.threshold - currentValue).toFixed(2)}` : `${Math.ceil(nextReward.threshold - currentValue)}`)
              ) : (
                config.calculationType === 'cartTotal' 
                  ? `Add ${currencySymbol}${(nextReward.threshold - currentValue).toFixed(2)} more to unlock rewards!`
                  : `Add ${Math.ceil(nextReward.threshold - currentValue)} more item${Math.ceil(nextReward.threshold - currentValue) === 1 ? '' : 's'} to unlock rewards!`
              )}
            </span>
          ) : null}
        </div>
      )}
      
      {/* Progress bar with tiers */}
      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <div style={{ position: 'relative', width: '100%', height: '6px' }}>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: config.backgroundColor,
            borderRadius: '3px',
            position: 'absolute',
            top: 0,
            left: 0
          }} />
          <div style={{
            width: `${progressPercentage}%`,
            height: '6px',
            backgroundColor: config.barColor,
            transition: 'width 0.3s ease',
            borderRadius: '3px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }} />
        </div>
        
        {/* Tier markers */}
        {sortedRewards.map((reward, index) => {
            const position = (reward.threshold / maxThreshold) * 100;
            const isUnlocked = currentValue >= reward.threshold;
            const isLast = index === sortedRewards.length - 1;
            
            return (
              <div
                key={reward.id}
                style={{
                  position: 'absolute',
                  left: isLast ? `calc(${position}% - 20px)` : `${position}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    border: `2px solid ${isUnlocked ? config.completeIconColor : config.incompleteIconColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'default'
                  }}
                  title={`${reward.rewardText || reward.description || 'Reward'} - ${config.calculationType === 'cartTotal' ? `${currencySymbol}${reward.threshold}` : `${reward.threshold} items`}`}
                >
                  {isUnlocked ? (
                    <span style={{ fontSize: '22px', color: config.completeIconColor }}>✓</span>
                  ) : reward.rewardType && reward.rewardType !== 'custom' ? (
                    <img 
                      src={getRewardIcon(reward.rewardType)} 
                      alt={reward.rewardType}
                      style={{ 
                        width: '22px', 
                        height: '22px',
                        filter: 'grayscale(1) brightness(0.4)',
                        color: config.incompleteIconColor
                      }} 
                    />
                  ) : (
                    <span style={{ fontSize: '20px', color: config.incompleteIconColor }}>
                      {reward.icon || '🎁'}
                    </span>
                  )}
                </div>
                
                {/* Reward text below icon */}
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: isUnlocked ? config.completeIconColor : '#999',
                  fontWeight: isUnlocked ? '600' : '400',
                  width: '60px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {reward.rewardText || reward.description || 'Reward'}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
