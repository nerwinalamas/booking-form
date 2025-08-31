interface StepsProps {
  currentStep: number;
}

const Steps = ({ currentStep }: StepsProps) => {
  return (
    <div className="mb-6">
      <p className="text-sm text-gray-600">
        Step {currentStep} of 4:{" "}
        {
          [
            "Client Information",
            "Service Details",
            "Preferred Schedule",
            "Additional Information",
          ][currentStep - 1]
        }
      </p>
      <div className="flex mt-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex-1 h-2 rounded ${
              step <= currentStep ? "bg-blue-600" : "bg-gray-200"
            } ${step < 4 ? "mr-2" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Steps;
