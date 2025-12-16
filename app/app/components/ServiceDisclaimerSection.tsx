interface ServiceDisclaimerSectionProps {
  enableServiceDisclaimerDialog: boolean;
  onEnableServiceDisclaimerDialogChange: (value: boolean) => void;
}

export default function ServiceDisclaimerSection({
  enableServiceDisclaimerDialog,
  onEnableServiceDisclaimerDialogChange,
}: ServiceDisclaimerSectionProps) {
  const handleDialogToggle = (checked: boolean) => {
    onEnableServiceDisclaimerDialogChange(checked);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-background-dark/30 rounded-lg border border-light/10">
        <input
          type="checkbox"
          id="enableServiceDisclaimerDialog"
          checked={enableServiceDisclaimerDialog}
          onChange={e => handleDialogToggle(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-light/20 bg-background-dark/50 text-primary focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex-1">
          <label
            htmlFor="enableServiceDisclaimerDialog"
            className="text-sm font-medium cursor-pointer"
          >
            Enable Service Disclaimer Dialog
          </label>
          <p className="text-xs text-gray-400 mt-1">
            Show a one-time disclaimer dialog on first visit to inform users
            that this platform uses Orderly Network's white-label solution and
            is not a direct operator of the orderbook. The dialog will be stored
            in localStorage and won't show again after the user accepts.
          </p>
        </div>
      </div>

      <div className="p-4 bg-background-dark/20 rounded-lg border border-light/5 slide-fade-in">
        <div className="text-xs text-gray-400 space-y-2">
          <p className="font-medium text-gray-300">Preview:</p>
          <p>
            When enabled, users will see a dialog on their first visit with the
            following message:
          </p>
          <div className="mt-2 p-4 bg-background-dark/50 rounded border border-light/10 text-xs space-y-3">
            <p className="text-white font-medium text-sm">Service Disclaimer</p>

            <p className="text-gray-300">
              <span className="text-gray-200">[Your Broker Name]</span> uses
              Orderly Network's white-label solution and is not a direct
              operator of the orderbook.
            </p>

            <p className="text-gray-300 text-2xs">
              By clicking 'Agree', users will access a third-party website using
              Orderly software.{" "}
              <span className="text-gray-200">[Your Broker Name]</span> confirms
              that it does not directly operate or control the infrastructure or
              take responsibility for code operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
