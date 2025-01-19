const headerContent = `
  <header>
     <h2 class="logo">
            <img src="../images/CosmosLogo.png" alt="Cosmos Odyssey">
        </h2>
    <nav class="navigation">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>
`;
document.addEventListener('DOMContentLoaded', () => {
  const headerElement = document.getElementById('header');
  headerElement.innerHTML = headerContent;
});