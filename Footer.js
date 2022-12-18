import React from 'react';

function Footer() {
    return <footer>
        <div>
            Sound from <a href="https://www.zapsplat.com/author/adam-a-johnson/" rel="noreferrer noopener" target="_blank">Adam A Johnson @ Zapsplat.com</a>, licensed under <a href="https://www.zapsplat.com/license-type/standard-license/" rel="noreferrer noopener" target="_blank">Standard License</a>
        </div>
        <div>
            <a href="https://www.aggiewb.com" rel="noreferrer noopener" target="_blank">Aggie Wheeler Bateman</a> &copy; {new Date().getFullYear()}
        </div>
    </footer>;
}

export default Footer;