import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2, CheckCircle2, AlertCircle, ExternalLink, AlertTriangle, Copy, MessageSquare } from 'lucide-react';
import { FormField } from './types';
import FormPreview from './FormPreview';
import { useWalletValidation } from '../../context/CLIContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  formName: string;
  fields: FormField[];
}

type Step = 'preview' | 'template' | 'instructions' | 'validate' | 'process' | 'complete';

type TemplateType = 'sui-wallet' | 'zklogin';

interface DeployResult {
  success: boolean;
  slug: string;
  siteObjectId: string | null;
  portalUrl: string | null;
  output: string;
  error?: string;
}

export default function PublishModal({ isOpen, onClose, formName, fields }: PublishModalProps) {
  const [step, setStep] = useState<Step>('preview');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('sui-wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [epochs, setEpochs] = useState(1);
  const [formDescription, setFormDescription] = useState('');
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [deployOutput, setDeployOutput] = useState('');
  const { status, isReady } = useWalletValidation();
  
  // Epoch duration based on network
  const isMainnet = status.network === 'mainnet';
  const daysPerEpoch = isMainnet ? 14 : 1;
  
  const epochOptions = isMainnet ? [
    { value: 1, label: '1 epoch (2 weeks)' },
    { value: 4, label: '4 epochs (~2 months)' },
    { value: 13, label: '13 epochs (~6 months)' },
    { value: 26, label: '26 epochs (~1 year)' },
  ] : [
    { value: 1, label: '1 epoch (1 day)' },
    { value: 7, label: '7 epochs (1 week)' },
    { value: 14, label: '14 epochs (2 weeks)' },
    { value: 30, label: '30 epochs (1 month)' },
  ];
  
  const networkLabel = isMainnet ? 'Mainnet' : 'Testnet';

  const steps: { key: Step; label: string }[] = [
    { key: 'preview', label: 'Preview' },
    { key: 'template', label: 'Template' },
    { key: 'instructions', label: 'Instructions' },
    { key: 'validate', label: 'Validate' },
    { key: 'process', label: 'Publish' },
    { key: 'complete', label: 'Done' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const handleNext = () => {
    if (step === 'preview') setStep('template');
    else if (step === 'template') setStep('instructions');
    else if (step === 'instructions') setStep('validate');
    else if (step === 'validate' && isReady) setStep('process');
  };

  const handleBack = () => {
    if (step === 'template') setStep('preview');
    else if (step === 'instructions') setStep('template');
    else if (step === 'validate') setStep('instructions');
  };

  const handlePublish = async () => {
    setIsProcessing(true);
    setDeployOutput('');
    setDeployResult(null);

    try {
      // Network from wallet status (defaults to testnet)
      const network = status.network || 'testnet';

      // Run deploy - include selected template
      const result = await window.api.cli.deploySite({
        epochs,
        network,
        formName,
        formFields: fields,
        formDescription,
        template: selectedTemplate,
      });

      setDeployResult(result);
      setDeployOutput(result.output);

      if (result.success) {
        // Save deployment info
        try {
          await window.api.deployments.save({
            slug: result.slug!,
            network,
            epochs,
            formName,
            formFields: fields,
            creatorAddress: status.address || 'unknown',
            siteObjectId: result.siteObjectId || null,
            portalUrl: result.portalUrl || null,
          });
          console.log('[Deploy] Saved deployment info');
        } catch (err) {
          console.error('[Deploy] Failed to save deployment:', err);
        }
        
        setStep('complete');
      }
    } catch (error) {
      setDeployResult({
        success: false,
        slug: '',
        siteObjectId: null,
        portalUrl: null,
        output: '',
        error: error instanceof Error ? error.message : 'Deployment failed',
      });
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep('preview');
    setDeployResult(null);
    setDeployOutput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl mx-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)] shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-default)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Publish to Walrus</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-bg-elevated)]">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                i <= currentStepIndex
                  ? 'bg-accent-primary text-white'
                  : 'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]'
              }`}>
                {i + 1}
              </div>
              {/* <span className={`text-sm ${i <= currentStepIndex ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                {s.label}
              </span> */}
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 rounded ${
                  i < currentStepIndex ? 'bg-accent-primary' : 'bg-[var(--color-border-default)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          {step === 'preview' && (
            <div>
              <h3 className="font-medium text-[var(--color-text-primary)] mb-4">Review your form</h3>
              <FormPreview formName={formName} fields={fields} />
            </div>
          )}

          {step === 'template' && (
            <div>
              <h3 className="font-medium text-[var(--color-text-primary)] mb-2">Choose template</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Select how users will authenticate when submitting this form
              </p>
              
              <div className="space-y-3">
                {/* Sui Wallet Template */}
                <button
                  onClick={() => setSelectedTemplate('sui-wallet')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTemplate === 'sui-wallet'
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] hover:border-accent-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      selectedTemplate === 'sui-wallet'
                        ? 'border-accent-primary bg-accent-primary'
                        : 'border-[var(--color-border-default)]'
                    }`}>
                      {selectedTemplate === 'sui-wallet' && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-[var(--color-text-primary)]">Sui Wallet</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">Simple</span>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] mb-2">
                        Users connect with a Sui wallet extension (Sui Wallet, Ethos, etc.)
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-[var(--color-text-secondary)]">Auth: <span className="text-[var(--color-text-primary)]">Wallet Extension</span></span>
                        <span className="text-[var(--color-text-secondary)]">Gas: <span className="text-orange-500">User pays</span></span>
                        <span className="text-[var(--color-text-secondary)]">Setup: <span className="text-green-500">None</span></span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* zkLogin Template */}
                <button
                  onClick={() => setSelectedTemplate('zklogin')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTemplate === 'zklogin'
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] hover:border-accent-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      selectedTemplate === 'zklogin'
                        ? 'border-accent-primary bg-accent-primary'
                        : 'border-[var(--color-border-default)]'
                    }`}>
                      {selectedTemplate === 'zklogin' && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-[var(--color-text-primary)]">zkLogin (Enoki)</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">Social Login</span>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] mb-2">
                        Users sign in with Google, Facebook, or Twitch. No wallet extension needed.
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-[var(--color-text-secondary)]">Auth: <span className="text-[var(--color-text-primary)]">OAuth (Google)</span></span>
                        <span className="text-[var(--color-text-secondary)]">Gas: <span className="text-green-500">Can sponsor</span></span>
                        <span className="text-[var(--color-text-secondary)]">Setup: <span className="text-yellow-500">Extra config</span></span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {selectedTemplate === 'zklogin' && (
                <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">Requires Enoki setup</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        For sponsored transactions, you'll need to configure Enoki API keys in your deployment.
                        See <a href="https://enoki.mystenlabs.com" target="_blank" rel="noopener" className="text-accent-primary hover:underline">enoki.mystenlabs.com</a> for details.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'instructions' && (
            <div>
              <h3 className="font-medium text-[var(--color-text-primary)] mb-2">Add instructions</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                These instructions will be shown to users when they fill out your form.
              </p>
              
              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={16} className="text-accent-primary" />
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                    Form instructions (optional)
                  </label>
                </div>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Thanks for participating in our meetup. Your feedback will help us improve future events."
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary resize-none"
                  rows={4}
                />
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  This will appear at the top of your form when users open it.
                </p>
              </div>
            </div>
          )}

          {step === 'validate' && (
            <div className="font-mono text-sm">
              {status.isLoading ? (
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Checking environment...</span>
                </div>
              ) : (
                <div className="space-y-1"> 
                  
                  {/* CLI Tools */}
                  <div className="flex items-center gap-2">
                    {status.versions?.sui.found ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <AlertCircle size={14} className="text-red-500" />
                    )}
                    <span className="text-[var(--color-text-secondary)]">SUI CLI</span>
                    <span className="ml-auto text-[var(--color-text-primary)]">
                      {status.versions?.sui.found ? `${status.versions.sui.version}` : 'Not found'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status.versions?.walrus.found ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <AlertCircle size={14} className="text-red-500" />
                    )}
                    <span className="text-[var(--color-text-secondary)]">Walrus CLI</span>
                    <span className="ml-auto text-[var(--color-text-primary)]">
                      {status.versions?.walrus.found ? `${status.versions.walrus.version}` : 'Not found'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status.versions?.siteBuilder.found ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <AlertCircle size={14} className="text-red-500" />
                    )}
                    <span className="text-[var(--color-text-secondary)]">Site Builder</span>
                    <span className="ml-auto text-[var(--color-text-primary)]">
                      {status.versions?.siteBuilder.found ? `${status.versions.siteBuilder.version}` : 'Not found'}
                    </span>
                  </div>

                  <div className="my-2 border-t border-[var(--color-border-default)]" />

                  {/* Wallet Status */}
                  <div className="flex items-center gap-2">
                    {status.network ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <AlertCircle size={14} className="text-yellow-500" />
                    )}
                    <span className="text-[var(--color-text-secondary)]">Network</span>
                    <span className="ml-auto text-[var(--color-text-primary)]">
                      {status.network || 'Not connected'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status.address ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <AlertCircle size={14} className="text-red-500" />
                    )}
                    <span className="text-[var(--color-text-secondary)]">Active Address</span>
                    <span className="ml-auto text-[var(--color-text-primary)]">
                      {status.address ? `${status.address.slice(0, 10)}...` : 'None'}
                    </span>
                  </div>

                  <div className="my-2 border-t border-[var(--color-border-default)]" />

                  {/* Balances */}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-[var(--color-text-secondary)]">SUI Balance</span>
                    <span className="ml-auto text-[var(--color-text-primary)]">
                      {status.suiBalance !== null ? `${status.suiBalance} SUI` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-[var(--color-text-secondary)]">WAL Balance</span>
                    <span className="ml-auto text-[var(--color-text-primary)]">
                      {status.walBalance !== null ? `${status.walBalance} WAL` : 'N/A'}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-2 border-t border-[var(--color-border-default)]">
                    {isReady ? (
                      <p className="text-green-500">✓ Environment ready</p>
                    ) : (
                      <p className="text-yellow-500">⚠ Some checks failed</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'process' && (
            <div className="space-y-4">
              {!isProcessing && !deployResult && (
                <>
                  <h3 className="font-medium text-[var(--color-text-primary)]">Configure Deployment</h3>
                  <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        Duration (epochs)
                      </label>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent-primary/20 text-accent-primary">
                        {networkLabel}
                      </span>
                    </div>
                    <select
                      value={epochs}
                      onChange={(e) => setEpochs(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary"
                    >
                      {epochOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      {isMainnet ? '1 epoch = 2 weeks on mainnet' : '1 epoch = 1 day on testnet'}
                    </p>
                  </div>
                  {status.network !== 'mainnet' && (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-[var(--color-text-primary)]">Testnet Only</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            This will deploy to testnet. To access your site, run a local portal.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={32} className="text-accent-primary animate-spin" />
                  <span className="ml-3 text-[var(--color-text-muted)]">Deploying to Walrus...</span>
                </div>
              )}

              {deployOutput && (
                <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] font-mono text-xs whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {deployOutput}
                </div>
              )}

              {deployResult && !deployResult.success && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-500">Deployment failed: {deployResult.error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'complete' && deployResult && deployResult.success && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Published successfully!</h3>
                <p className="text-sm text-[var(--color-text-muted)]">Your form is now stored on Walrus</p>
              </div>

              {deployResult.siteObjectId && (
                <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-[var(--color-text-muted)]">Site Object ID</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(deployResult.siteObjectId!)}
                      className="p-1.5 rounded-lg hover:bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-mono text-[var(--color-text-primary)] truncate">{deployResult.siteObjectId}</p>
                </div>
              )}

              {deployResult.portalUrl && (
                <div className="p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/30">
                  <div className="flex items-center gap-2 mb-1">
                    <ExternalLink size={16} className="text-accent-primary" />
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Your Site</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(deployResult.portalUrl!)}
                      className="ml-auto p-1.5 rounded-lg hover:bg-accent-primary/20 text-[var(--color-text-muted)] hover:text-accent-primary transition-colors"
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">{networkLabel} - run a local portal to view:</p>
                  <p className="text-sm font-mono text-accent-primary truncate">{deployResult.portalUrl}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[var(--color-text-muted)]">Duration</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent-primary/20 text-accent-primary">
                    {networkLabel}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-primary)]">{epochs} epochs ({epochs * daysPerEpoch} days)</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-default)]">
          <button
            onClick={handleBack}
            className={`px-5 py-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors ${
              step === 'preview' || step === 'complete' ? 'invisible' : ''
            }`}
          >
            Back
          </button>
          
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
          >
            {step === 'complete' ? 'Close' : 'Cancel'}
          </button>
          
          {step === 'preview' && (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
            >
              Continue
            </button>
          )}

          {step === 'template' && (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
            >
              Continue
            </button>
          )}

          {step === 'instructions' && (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
            >
              Validate Environment
            </button>
          )}

          {step === 'validate' && (
            <button
              onClick={handleNext}
              disabled={!isReady || status.isLoading}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${
                isReady && !status.isLoading
                  ? 'bg-accent-primary text-white hover:bg-accent-primary-hover'
                  : 'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] cursor-not-allowed'
              }`}
            >
              {status.isLoading ? 'Checking...' : isReady ? 'Continue' : 'Fix Issues First'}
            </button>
          )}

          {step === 'process' && !isProcessing && !deployResult && (
            <button
              onClick={handlePublish}
              className="px-5 py-2.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
            >
              Deploy Now
            </button>
          )}

          {step === 'process' && !isProcessing && deployResult && !deployResult.success && (
            <button
              onClick={handlePublish}
              className="px-5 py-2.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}