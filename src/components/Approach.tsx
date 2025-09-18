import React from 'react';
import { Heart, Users2, Brain, Target, Shield, Lightbulb } from 'lucide-react';

const Approach = () => {
  const principles = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Every interaction is grounded in empathy, understanding, and genuine care for your child's wellbeing."
    },
    {
      icon: Users2,
      title: "Family-Centered",
      description: "We work collaboratively with parents and caregivers as essential partners in the healing process."
    },
    {
      icon: Brain,
      title: "Evidence-Based",
      description: "Treatment approaches are grounded in the latest research and proven therapeutic methodologies."
    },
    {
      icon: Target,
      title: "Individualized",
      description: "Each treatment plan is uniquely tailored to your child's specific needs, strengths, and circumstances."
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description: "Creating a secure, non-judgmental space where children feel comfortable expressing themselves."
    },
    {
      icon: Lightbulb,
      title: "Strength-Based",
      description: "Focusing on your child's inherent strengths and resilience to build confidence and coping skills."
    }
  ];

  const process = [
    {
      step: "1",
      title: "Initial Consultation",
      description: "We begin with a comprehensive assessment to understand your child's unique situation and needs."
    },
    {
      step: "2",
      title: "Collaborative Planning",
      description: "Together with your family, we develop a personalized treatment plan that fits your goals and preferences."
    },
    {
      step: "3",
      title: "Active Treatment",
      description: "Implementation of evidence-based interventions with regular monitoring and adjustment as needed."
    },
    {
      step: "4",
      title: "Ongoing Support",
      description: "Continuous care and support, with regular check-ins to ensure sustained progress and wellbeing."
    }
  ];

  return (
    <section id="approach" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-lg">Our Approach</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">
            Healing Through 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600"> Understanding & Care</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our therapeutic approach is built on the foundation of trust, respect, and evidence-based practice. 
            We believe in the power of collaboration and the importance of treating the whole child within their family system.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {principles.map((principle, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl w-fit mx-auto mb-6 group-hover:shadow-lg transition-shadow duration-300">
                <principle.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{principle.title}</h3>
              <p className="text-gray-600 leading-relaxed">{principle.description}</p>
            </div>
          ))}
        </div>

        {/* Treatment Process */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Treatment Process</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A structured, collaborative approach that puts your child and family at the center of care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                    {step.step}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <div className="w-full h-0.5 bg-gradient-to-r from-blue-200 to-teal-200"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy Statement */}
        <div className="mt-16 text-center">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
            <blockquote className="text-2xl font-medium text-gray-700 leading-relaxed mb-6 italic">
              "Mental health is not a destination, but a process. It's about how you drive, not where you're going. 
              My commitment is to walk alongside your family on this journey, providing guidance, support, and hope every step of the way."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg">Dr. Anna-Maria Fytrou</p>
                <p className="text-gray-600">Child & Adolescent Psychiatrist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;