namespace Reddah.Core.IoC
{
    public interface ILocator
    {
        object LocateComponent();
    }

    public interface ILocator<TService> : ILocator
    {
        new TService LocateComponent();
    }
}
