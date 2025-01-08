document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('qualification-form');
    
    if (form) {
        // Initialize form handling
        populateHiddenFields();
        initPhoneFormatting();
        initFormSubmission();
    }

    function populateHiddenFields() {
        const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_channel', 'utm_consent', 'utm_term', 'utm_airtime', 'utm_partner', 'utm_clickid'];
        utmFields.forEach(field => {
            const value = getQueryParam(field) || '';
            let hiddenInput = document.getElementById(field);
            if (hiddenInput) {
                hiddenInput.value = value;
            }
        });

        // Set static fields
        const staticFields = [
            { name: 'type_of_case', value: 'Roundup' },
            { name: 'campaign_id', value: '6388e4db7fd68' },
            { name: 'campaignkey', value: 'qy9YNwJVBMgrkj36hPRm' },
            { name: 'xxTrustedFormCertUrl', value: getTrustedFormCertUrl() }
        ];

        staticFields.forEach(field => {
            let hiddenInput = document.getElementById(field.name);
            if (hiddenInput) {
                hiddenInput.value = field.value;
            }
        });
    }

    function initPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            });

            phoneInput.addEventListener('keypress', function(e) {
                if (e.key.match(/[^0-9]/)) {
                    e.preventDefault();
                }
            });
        }
    }

    function initFormSubmission() {
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        // Check required checkboxes
        const requiredCheckboxes = form.querySelectorAll('input[type="checkbox"][required]');
        let allChecked = true;
        requiredCheckboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allChecked = false;
            }
        });

        if (!allChecked) {
            alert('Please agree to all the required terms before submitting the form.');
            return;
        }

        // Collect form data
        const fields = [];
        const inputFields = form.querySelectorAll('input[name], textarea[name]');
        inputFields.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.checked) {
                    fields.push({
                        "objectTypeId": "0-1",
                        "name": input.name,
                        "value": input.value
                    });
                }
            } else {
                if (input.name === 'how_can_we_help_' && input.value.trim() === '') {
                    fields.push({
                        "objectTypeId": "0-1",
                        "name": input.name,
                        "value": "No additional details provided"
                    });
                } else {
                    fields.push({
                        "objectTypeId": "0-1",
                        "name": input.name,
                        "value": input.value
                    });
                }
            }
        });

        const hutk = getCookie('hubspotutk');
        const data = {
            submittedAt: new Date().getTime(),
            fields: fields,
            context: {
                pageUri: window.location.href,
                pageName: document.title
            },
            legalConsentOptions: {
                consent: {
                    consentToProcess: true,
                    text: `By clicking on the "Submit" button below, you agree to be contacted about your potential case or promotional offers sent by or on behalf of Legal Injury Advocates, a trade name of Saddle Rock Legal Group, LLC, and its agents, at the phone number and email address you provided above, which you confirm is your truthful and accurate number and email. You may receive live calls, automated calls, emails or text messages even though you are on a national or state "Do Not Call" list. You understand consent is not a condition of any purchase of any goods or services. By checking this box you also consent to our Terms & Conditions and Privacy Policy.`,
                    communications: [
                        {
                            value: true,
                            subscriptionTypeId: 999,
                            text: "I agree to receive communications."
                        }
                    ]
                }
            }
        };
        if (hutk) data.context.hutk = hutk;

        // Submit to HubSpot
        const portalId = "44986416";
        const formId = "74c096af-b628-4fa0-83f1-122d925f37f2";
        const submitFormUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

        try {
            const response = await fetch(submitFormUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.href = appendUTMParametersToUrl("https://legalinjuryadvocates.com/thank-you-roundup");
            } else {
                const errorData = await response.json();
                console.error('Submission error:', errorData);
                alert('An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    }

    // Utility functions
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }

    function getTrustedFormCertUrl() {
        // Implement your TrustedForm logic here
        return '';
    }

    function getUTMParameters() {
        const params = {};
        window.location.search.substring(1).split("&").forEach(function(item) {
            const [key, value] = item.split("=");
            if (key.startsWith("utm_")) {
                params[key] = decodeURIComponent(value);
            }
        });
        return params;
    }

    function appendUTMParametersToUrl(link) {
        const utmParams = getUTMParameters();
        const utmQueryString = Object.keys(utmParams)
            .map(key => `${key}=${encodeURIComponent(utmParams[key])}`)
            .join('&');

        if (utmQueryString) {
            link += (link.indexOf('?') === -1 ? '?' : '&') + utmQueryString;
        }
        return link;
    }

    // Add FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            
            // Toggle active class on the clicked item
            faqItem.classList.toggle('active');
            
            // Optionally close other open FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
        });
    });
}); 