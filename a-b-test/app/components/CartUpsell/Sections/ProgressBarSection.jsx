import InfoButton from '../Shared/InfoButton';
import { getCurrencySymbol, getRewardTypeIcon } from '../../../utils/currencyHelpers';

export default function ProgressBarSection({ config, onUpdate, currencyCode = 'USD' }) {
  const currencySymbol = getCurrencySymbol(currencyCode);

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Progress Bar</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onUpdate({ ...config, enabled: e.target.checked })}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontSize: '14px' }}>Enable Progress Bar</span>
        </label>
      </div>

      {config.enabled && (
        <>
          {/* General Settings Section */}
          <div style={{ 
            marginBottom: '32px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
              General Settings
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.showRewardsOnEmptyCart}
                  onChange={(e) => onUpdate({ ...config, showRewardsOnEmptyCart: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>Show rewards on empty cart</span>
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                Bar Background Color
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => onUpdate({ ...config, backgroundColor: e.target.value })}
                  style={{ 
                    width: '100%',
                    padding: '10px 50px 10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => onUpdate({ ...config, backgroundColor: e.target.value })}
                  style={{ 
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                Bar Foreground Color
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={config.barColor}
                  onChange={(e) => onUpdate({ ...config, barColor: e.target.value })}
                  style={{ 
                    width: '100%',
                    padding: '10px 50px 10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="color"
                  value={config.barColor}
                  onChange={(e) => onUpdate({ ...config, barColor: e.target.value })}
                  style={{ 
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                Complete Reward Tier Icon Color
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={config.completeIconColor}
                  onChange={(e) => onUpdate({ ...config, completeIconColor: e.target.value })}
                  style={{ 
                    width: '100%',
                    padding: '10px 50px 10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="color"
                  value={config.completeIconColor}
                  onChange={(e) => onUpdate({ ...config, completeIconColor: e.target.value })}
                  style={{ 
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                Incomplete Reward Tier Icon Color
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={config.incompleteIconColor}
                  onChange={(e) => onUpdate({ ...config, incompleteIconColor: e.target.value })}
                  style={{ 
                    width: '100%',
                    padding: '10px 50px 10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="color"
                  value={config.incompleteIconColor}
                  onChange={(e) => onUpdate({ ...config, incompleteIconColor: e.target.value })}
                  style={{ 
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                Text after completing full rewards bar
              </label>
              <div style={{ 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '8px', 
                  borderBottom: '1px solid #e5e7eb', 
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  gap: '4px'
                }}>
                  <button
                    onClick={() => {
                      const textArea = document.getElementById('completion-text-input');
                      const start = textArea.selectionStart;
                      const end = textArea.selectionEnd;
                      if (start === end) return;
                      const selectedText = config.completionText.substring(start, end);
                      const newText = config.completionText.substring(0, start) + '<b>' + selectedText + '</b>' + config.completionText.substring(end);
                      onUpdate({ ...config, completionText: newText });
                    }}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    B
                  </button>
                  <button
                    onClick={() => {
                      const textArea = document.getElementById('completion-text-input');
                      const start = textArea.selectionStart;
                      const end = textArea.selectionEnd;
                      if (start === end) return;
                      const selectedText = config.completionText.substring(start, end);
                      const newText = config.completionText.substring(0, start) + '<i>' + selectedText + '</i>' + config.completionText.substring(end);
                      onUpdate({ ...config, completionText: newText });
                    }}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      fontStyle: 'italic',
                      fontSize: '14px'
                    }}
                  >
                    I
                  </button>
                  <button
                    onClick={() => {
                      const textArea = document.getElementById('completion-text-input');
                      const start = textArea.selectionStart;
                      const end = textArea.selectionEnd;
                      if (start === end) return;
                      const selectedText = config.completionText.substring(start, end);
                      const newText = config.completionText.substring(0, start) + '<u>' + selectedText + '</u>' + config.completionText.substring(end);
                      onUpdate({ ...config, completionText: newText });
                    }}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '14px'
                    }}
                  >
                    U
                  </button>
                </div>
                <input
                  id="completion-text-input"
                  type="text"
                  value={config.completionText}
                  onChange={(e) => onUpdate({ ...config, completionText: e.target.value })}
                  style={{ 
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Rewards Calculation Section */}
          <div style={{ 
            marginBottom: '32px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
              Rewards Calculation
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '12px' }}>
                <input
                  type="radio"
                  name="calculation-type"
                  value="cartTotal"
                  checked={config.calculationType === 'cartTotal'}
                  onChange={(e) => onUpdate({ ...config, calculationType: e.target.value })}
                  style={{ marginRight: '8px', marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Cart Total</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    Your rewards will be calculated based on the total amount of the cart.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="calculation-type"
                  value="itemCount"
                  checked={config.calculationType === 'itemCount'}
                  onChange={(e) => onUpdate({ ...config, calculationType: e.target.value })}
                  style={{ marginRight: '8px', marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Item Count</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    Your rewards will be calculated based on the number of items in the cart.
                  </div>
                </div>
              </label>
            </div>

            {config.calculationType === 'cartTotal' && (
              <div style={{ 
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.usePreDiscountedPrices}
                    onChange={(e) => onUpdate({ ...config, usePreDiscountedPrices: e.target.checked })}
                    style={{ marginRight: '8px', marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Use pre-discounted prices for cart total
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                      Enable calculating reward bar tiers based on the cart total before any discounts are applied. 
                      This ensures that rewards are based on the original prices of items, allowing you to maintain 
                      consistent reward thresholds regardless of any discounts given.
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Reward Tiers Management Section */}
          <div style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0 }}>
                Reward Tiers
              </h3>
              <button
                onClick={() => {
                  const rewards = config.rewards || [];
                  if (rewards.length >= 4) {
                    alert('Maximum 4 reward tiers allowed');
                    return;
                  }
                  const newId = Math.max(0, ...rewards.map(r => r.id)) + 1;
                  const updatedRewards = [...rewards, {
                    id: newId,
                    threshold: config.calculationType === 'cartTotal' ? 100 : 5,
                    rewardType: 'free_gift',
                    rewardText: 'New Reward',
                    progressText: 'Add {{amount_left}} more to unlock {{goal}}!',
                    icon: '🎁'
                  }].sort((a, b) => a.threshold - b.threshold);
                  onUpdate({ ...config, rewards: updatedRewards });
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: (config.rewards || []).length >= 4 ? '#9ca3af' : '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: (config.rewards || []).length >= 4 ? 'not-allowed' : 'pointer',
                  opacity: (config.rewards || []).length >= 4 ? 0.6 : 1
                }}
                disabled={(config.rewards || []).length >= 4}
              >
                + Add Tier
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Define milestone rewards that customers can unlock as they add items to their cart. Maximum 4 tiers allowed.
            </div>

            {(!config.rewards || config.rewards.length === 0) ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px', 
                color: '#9ca3af',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '2px dashed #e5e7eb'
              }}>
                No reward tiers added yet. Click "Add Tier" to create one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {config.rewards.map((reward) => {
                  const rewardIcon = reward.rewardType === 'custom' 
                    ? reward.icon 
                    : getRewardTypeIcon(reward.rewardType);

                  return (
                    <div key={reward.id} style={{ 
                      display: 'flex',
                      gap: '12px',
                      padding: '20px',
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: 1 }}>
                        {/* Threshold and Reward Type Row */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#6b7280', fontWeight: '500' }}>
                              {config.calculationType === 'cartTotal' 
                                ? `Threshold (${currencySymbol})` 
                                : 'Threshold (Items)'}
                            </label>
                            <input
                              type="number"
                              value={reward.threshold}
                              onChange={(e) => {
                                const updatedRewards = config.rewards.map(r => 
                                  r.id === reward.id ? { ...r, threshold: parseFloat(e.target.value) || 0 } : r
                                ).sort((a, b) => a.threshold - b.threshold);
                                onUpdate({ ...config, rewards: updatedRewards });
                              }}
                              style={{ 
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </div>

                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#6b7280', fontWeight: '500' }}>
                              Reward Type
                            </label>
                            <select
                              value={reward.rewardType || 'free_gift'}
                              onChange={(e) => {
                                const newType = e.target.value;
                                const updatedRewards = config.rewards.map(r => 
                                  r.id === reward.id 
                                    ? { ...r, rewardType: newType, icon: getRewardTypeIcon(newType) } 
                                    : r
                                );
                                onUpdate({ ...config, rewards: updatedRewards });
                              }}
                              style={{ 
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                              }}
                            >
                              <option value="shipping">🚚 Shipping</option>
                              <option value="free_gift">🎁 Free Gift</option>
                              <option value="discount">💰 Discount</option>
                              <option value="custom">✏️ Custom</option>
                            </select>
                          </div>

                          {reward.rewardType === 'custom' && (
                            <div style={{ flex: '0 0 80px' }}>
                              <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#6b7280', fontWeight: '500' }}>
                                Icon
                              </label>
                              <input
                                type="text"
                                value={reward.icon}
                                onChange={(e) => {
                                  const updatedRewards = config.rewards.map(r => 
                                    r.id === reward.id ? { ...r, icon: e.target.value } : r
                                  );
                                  onUpdate({ ...config, rewards: updatedRewards });
                                }}
                                placeholder="🎉"
                                style={{ 
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '20px',
                                  textAlign: 'center'
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Reward Text */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#6b7280', fontWeight: '500' }}>
                            Reward Text
                          </label>
                          <input
                            type="text"
                            value={reward.rewardText || reward.description || ''}
                            onChange={(e) => {
                              const updatedRewards = config.rewards.map(r => 
                                r.id === reward.id ? { ...r, rewardText: e.target.value } : r
                              );
                              onUpdate({ ...config, rewards: updatedRewards });
                            }}
                            placeholder="e.g., Free Shipping on orders over $50"
                            style={{ 
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>

                        {/* Text Before Hitting Goal */}
                        <div>
                          <label style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            fontSize: '12px', 
                            marginBottom: '6px', 
                            color: '#6b7280', 
                            fontWeight: '500' 
                          }}>
                            Text Before Hitting Goal
                            <InfoButton text="You can use variables {{goal}} or {{amount_left}}" />
                          </label>
                          <input
                            type="text"
                            value={reward.progressText || ''}
                            onChange={(e) => {
                              const updatedRewards = config.rewards.map(r => 
                                r.id === reward.id ? { ...r, progressText: e.target.value } : r
                              );
                              onUpdate({ ...config, rewards: updatedRewards });
                            }}
                            placeholder="Add {{amount_left}} more to unlock {{goal}}!"
                            style={{ 
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const updatedRewards = config.rewards.filter(r => r.id !== reward.id);
                          onUpdate({ ...config, rewards: updatedRewards });
                        }}
                        style={{
                          padding: '8px',
                          backgroundColor: '#fee',
                          color: '#c00',
                          border: '1px solid #fcc',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          lineHeight: '1',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                        title="Delete tier"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
