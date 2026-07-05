import { execSync } from 'child_process';

function main() {
  console.log('\n✨ Code formatting complete! Running post-format checks...');

  try {
    // Example: Triggering your type-check script as part of the post-format workflow
    console.log('🔄 Verifying types...');
    execSync('npm run type-check', { stdio: 'inherit' });

    console.log('✅ Post-format verification successful!');
  } catch (error) {
    console.error('❌ Post-format verification failed.');
    process.exit(1);
  }
}

main();
