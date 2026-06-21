import { Command } from 'commander';

export const infoCmd = () => {
  return new Command('info')
    .description('Show validator versions and standards info')
    .action(() => {
      const info = {
        service: 'deutschland-stack-tools',
        version: process.env.npm_package_version || '1.0.0',
        description: 'ODF & PDF/UA compliance validator for Germany\'s Deutschland-Stack mandate',
        legal_basis: 'Deutschland-Stack Beschluss vom 18.06.2026',
        mandatory_from: '2028-01-01',
        supported_standards: {
          ODF: ['1.2', '1.3', '1.4'],
          PDF_UA: ['PDF/UA-1 (ISO 14289-1)', 'PDF/UA-2 (ISO 14289-2)'],
        },
      };

      console.log('🇩🇪  Deutschland-Stack Tools Information');
      console.log('------------------------------------------');
      console.log(`Version:       ${info.version}`);
      console.log(`Legal Basis:   ${info.legal_basis}`);
      console.log(`Mandatory:     ${info.mandatory_from}`);
      console.log('');
      console.log('Supported Standards:');
      console.log(`- ODF:         ${info.supported_standards.ODF.join(', ')}`);
      console.log(`- PDF/UA:      ${info.supported_standards.PDF_UA.join(', ')}`);
      console.log('------------------------------------------');
    });
};
