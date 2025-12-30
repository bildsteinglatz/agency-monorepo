'use client';

import React from 'react';

export function NewsletterSignup() {
  return (
    <div id="mc_embed_signup" className="w-full">
      <form 
        action="https://bildsteinglatz.us10.list-manage.com/subscribe/post?u=e6e0b5705c137c0dd54c5c636&amp;id=c4516b5c26&amp;f_id=0087cce5f0" 
        method="post" 
        id="mc-embedded-subscribe-form" 
        name="mc-embedded-subscribe-form" 
        className="validate space-y-4" 
        target="_blank" 
        noValidate
      >
        <div id="mc_embed_signup_scroll">
          <h2 className="title-text text-lg mb-4">Subscribe to our newsletter (3-4 per year):</h2>
          <div className="indicates-required text-xs mb-4 text-black body-text"><span className="asterisk text-[#ff6600]">*</span> Angaben erforderlich</div>
          
          <div className="mc-field-group mb-4">
            <label htmlFor="mce-EMAIL" className="block text-sm font-bold mb-1 body-text">Email Address <span className="asterisk text-[#ff6600]">*</span></label>
            <input 
              type="email" 
              name="EMAIL" 
              className="required email w-full p-2 border border-black dark:border-black bg-transparent focus:border-[#ff6600] outline-none transition-colors body-text" 
              id="mce-EMAIL" 
              required 
            />
          </div>
          
          <div className="mc-field-group mb-4">
            <label htmlFor="mce-FNAME" className="block text-sm font-bold mb-1 body-text">First Name </label>
            <input 
              type="text" 
              name="FNAME" 
              className="text w-full p-2 border border-black dark:border-black bg-transparent focus:border-[#ff6600] outline-none transition-colors body-text" 
              id="mce-FNAME" 
            />
          </div>
          
          <div className="mc-field-group mb-4">
            <label htmlFor="mce-LNAME" className="block text-sm font-bold mb-1 body-text">Last Name </label>
            <input 
              type="text" 
              name="LNAME" 
              className="text w-full p-2 border border-black dark:border-black bg-transparent focus:border-[#ff6600] outline-none transition-colors body-text" 
              id="mce-LNAME" 
            />
          </div>

          <div id="mce-responses" className="clear foot mb-4">
            <div className="response" id="mce-error-response" style={{ display: 'none' }}></div>
            <div className="response" id="mce-success-response" style={{ display: 'none' }}></div>
          </div>

          <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
            <input type="text" name="b_e6e0b5705c137c0dd54c5c636_c4516b5c26" tabIndex={-1} defaultValue="" />
          </div>
          
          <div className="optionalParent">
            <div className="clear foot flex items-center justify-between gap-4 flex-wrap">
              <input 
                type="submit" 
                name="subscribe" 
                id="mc-embedded-subscribe" 
                className="button cursor-pointer bg-[#ff6600] text-black px-6 py-2 font-bold hover:text-white transition-colors border-none nav-text text-sm" 
                value="Subscribe" 
              />
              <p style={{ margin: '0' }}>
                <a href="http://eepurl.com/i0GC4c" title="Mailchimp – Einfaches, schnelles E-Mail-Marketing">
                  <span style={{ display: 'inline-block', backgroundColor: 'transparent', borderRadius: '4px' }}>
                    <img 
                      className="refferal_badge" 
                      src="https://digitalasset.intuit.com/render/content/dam/intuit/mc-fe/en_us/images/intuit-mc-rewards-text-dark.svg" 
                      alt="Intuit Mailchimp" 
                      style={{ width: '150px', height: '30px', display: 'flex', padding: '2px 0px', justifyContent: 'center', alignItems: 'center' }} 
                    />
                  </span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
